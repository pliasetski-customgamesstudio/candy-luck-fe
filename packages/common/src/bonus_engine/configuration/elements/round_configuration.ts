import { ResourcesConfiguration } from './resources_configuration';
import { ComponentConfiguration } from './component_configuration';
import { parseRoundTypeEnum, RoundType } from '../../enums/round_type';
import { LinkedState } from '../../execute/executers/linked_state';
import { ConfigConstants } from '../config_constants';
import { ComponentType, parseComponentTypeEnum } from '../../enums/componet_type';
import { ButtonSetConfiguration } from './button_set_configuration';
import { SenderSetConfiguration } from './sender_set_configuration';
import { RandomGeneratorConfiguration } from './random_generator_configuration';
import { CardsGeneratorConfiguration } from './cards_generator_configuration';
import { CardColorSuitGeneratorConfiguration } from './card_color_suit_generator_configuration';
import { HistoryItemsConfiguration } from './history_items_configuration';
import { TutorialConfiguration } from './tutorial_configuration';
import { SceneProviderConfiguration } from './scene_provider_configuration';

export class RoundConfiguration extends ResourcesConfiguration {
  static fromJson(json: Record<string, any>): RoundConfiguration {
    const config = new RoundConfiguration();
    config.sceneName = json[ConfigConstants.sceneName];
    config.name = json[ConfigConstants.resourceName];

    config.serverIndexes = [];
    if (json[ConfigConstants.serverIndex] !== undefined) {
      const indexes = json[ConfigConstants.serverIndex];
      if (typeof indexes === 'number') {
        config.serverIndexes.push(indexes);
      } else if (Array.isArray(indexes)) {
        config.serverIndexes.push(...indexes.map((x) => (typeof x === 'number' ? x : parseInt(x))));
      }
    }
    config.type = parseRoundTypeEnum(json[ConfigConstants.roundType]);
    config.nextRoundMap = json[ConfigConstants.nextRoundMap]
      ? { ...json[ConfigConstants.nextRoundMap] }
      : {};
    config.execute = json[ConfigConstants.executeSection]
      ? json[ConfigConstants.executeSection].map((x: any) => LinkedState.fromJson(x))
      : [];
    config.components = json[ConfigConstants.components].map((config: any) => {
      switch (parseComponentTypeEnum(config[ConfigConstants.componentType])) {
        case ComponentType.ButtonSet:
          return ButtonSetConfiguration.fromJson(config);
        case ComponentType.Sender:
          return SenderSetConfiguration.fromJson(config);
        case ComponentType.SceneProvider:
          return new SceneProviderConfiguration(config);
        case ComponentType.RandomGenerator:
          return new RandomGeneratorConfiguration(config);
        case ComponentType.CardsGenerator:
          return new CardsGeneratorConfiguration(config);
        case ComponentType.CardColorSuitGenerator:
          return new CardColorSuitGeneratorConfiguration(config);
        case ComponentType.HistoryItems:
          return new HistoryItemsConfiguration(config);
        case ComponentType.Variables:
          return new ComponentConfiguration(config);
        case ComponentType.Tutorial:
          return new TutorialConfiguration(config);
        default:
          return null;
      }
    });

    return config;
  }

  public components: ComponentConfiguration[];
  public execute: LinkedState[];
  public type: RoundType;
  public serverIndexes: number[];
  public nextRoundMap: Record<string, number>;
}
