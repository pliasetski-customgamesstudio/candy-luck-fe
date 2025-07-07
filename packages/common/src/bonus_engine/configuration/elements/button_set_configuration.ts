import { ComponentConfiguration } from './component_configuration';
import { TemplateConfiguration } from './template_configuration';
import { parseSelectActionEnum, SelectAction } from '../../enums/select_action';
import {
  DisableTouchTrigger,
  parseDisableTouchTriggerEnum,
} from '../../enums/disable_touch_trigger';
import { ConfigConstants } from '../config_constants';

export class ButtonSetConfiguration extends ComponentConfiguration {
  template: TemplateConfiguration;
  indexesTemplate: TemplateConfiguration | null;
  selectAction: SelectAction | null;
  disableTouchTrigger: DisableTouchTrigger;
  sendValue: number;
  serverIndexes: number[] = [];

  static fromJson(json: Record<string, any>): ButtonSetConfiguration {
    const config = new ButtonSetConfiguration(json);

    config.selectAction =
      json[ConfigConstants.selectAction] !== undefined
        ? parseSelectActionEnum(json[ConfigConstants.selectAction])
        : null;
    config.disableTouchTrigger =
      json[ConfigConstants.disableTouchTrigger] !== undefined
        ? parseDisableTouchTriggerEnum(json[ConfigConstants.disableTouchTrigger])
        : DisableTouchTrigger.Auto;
    config.sendValue = json[ConfigConstants.sendValue];
    config.template = TemplateConfiguration.fromJson(json[ConfigConstants.template]);
    config.indexesTemplate = json[ConfigConstants.indexesTemplate]
      ? TemplateConfiguration.fromJson(json[ConfigConstants.indexesTemplate])
      : null;

    if (json[ConfigConstants.buttonsServerIndex]) {
      const indexes = json[ConfigConstants.buttonsServerIndex];
      if (typeof indexes === 'number') {
        config.serverIndexes.push(indexes);
      } else if (Array.isArray(indexes)) {
        config.serverIndexes.push(...indexes);
      }
    }

    return config;
  }
}
