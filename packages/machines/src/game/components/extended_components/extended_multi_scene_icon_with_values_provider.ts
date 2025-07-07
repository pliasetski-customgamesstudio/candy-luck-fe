import { MultiSceneIconWithValuesProvider } from '../icon_with_values/multi_scene_icon_with_values_provider';
import { Container, Random } from '@cgs/syd';
import { AbstractGameConfig } from '../../../reels_engine/game_config/abstract_game_config';
import { SlotSession } from '../../common/slot_session';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import { T_IGameConfigProvider, T_ISlotSessionProvider } from '../../../type_definitions';
import { IconWithValuesConfig } from '../../../reels_engine/game_config/game_config';
import { MultiSceneIconValueDescription } from '../icon_with_values/multi_scene_icon_value_description';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';

export class ExtendedMultiSceneIconWithValuesProvider extends MultiSceneIconWithValuesProvider {
  private _rand: Random = new Random();
  private _gameConfig: AbstractGameConfig;
  private _slotSession: SlotSession;

  constructor(container: Container) {
    super(container);
    this._gameConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this.gameStateMachine.init.entered.listen((_e) => this.addInitValuesToIcons());
  }

  protected createSystems(): void {}

  private addInitValuesToIcons(): void {
    const currentConfig: IconWithValuesConfig = this.getIconWithValuesConfig();
    if (!currentConfig || !currentConfig.iconWithValueConfigs) {
      return;
    }
    const response = this.gameStateMachine.curResponse;
    if (
      !response.specialSymbolGroups ||
      !response.specialSymbolGroups.some(
        (g) => g.type && currentConfig.specGroupTypeNames.includes(g.type)
      )
    ) {
      return;
    }
    const groups = response.specialSymbolGroups.filter(
      (g) => g.type && currentConfig.specGroupTypeNames.includes(g.type)
    );
    for (const group of groups) {
      const position = group.positions!.find((_) => true) ?? 0;
      const entity = this.reelsEngine.iconAnimationHelper
        .getEntitiesByFinalPosition(position)
        .find((_) => true)!;

      const value = group.totalJackPotWin ?? 0.0;
      const desc = new MultiSceneIconValueDescription('icon_txt', value, position, group.subType);
      entity.addComponent(ComponentNames.IconValue, desc);
      entity.addComponent(ComponentNames.NeedUpdate, true);
    }
  }

  private getIconWithValuesConfig(): IconWithValuesConfig {
    const config = this._gameConfig.iconWithValuesConfig;
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.event !=
        FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      const namedConfig = this._gameConfig.getNamedConfig(
        this.gameStateMachine.curResponse.freeSpinsInfo!.name
      );
      if (!namedConfig) {
        return config;
      }
      return namedConfig.iconWithValuesConfig!;
    }
    return this._gameConfig.iconWithValuesConfig;
  }

  public getFakeValueDescription(
    reel: number,
    line: number,
    drawId: number
  ): MultiSceneIconValueDescription | null {
    const pos = this.reelsEngine.getPosition(reel, line);
    const bet = this._slotSession.totalBet;
    const currentConfig: IconWithValuesConfig = this.getIconWithValuesConfig();

    if (!currentConfig.iconWithValueConfigs || !currentConfig.iconWithValueConfigs.has(drawId))
      return super.getFakeValueDescription(reel, line, drawId);

    const iconConfiguration = currentConfig.iconWithValueConfigs.get(drawId)!;
    let randomBaseValue = 0.0;
    if (iconConfiguration.values && iconConfiguration.values.length > 0) {
      randomBaseValue =
        iconConfiguration.values[this._rand.nextInt(iconConfiguration.values.length)];
    }

    const state = iconConfiguration.useSubTypeForState
      ? iconConfiguration.possibleIconStates![
          this._rand.nextInt(iconConfiguration.possibleIconStates!.length)
        ]
      : 'default';

    return iconConfiguration.shouldBeMultipliedByBet
      ? new MultiSceneIconValueDescription('icon_txt', randomBaseValue * bet, pos, state)
      : new MultiSceneIconValueDescription('icon_txt', randomBaseValue, pos, state);
  }

  public setIconPrice(): void {
    const currentConfig: IconWithValuesConfig = this.getIconWithValuesConfig();

    if (!currentConfig || !currentConfig.iconWithValueConfigs || !currentConfig.specGroupTypeNames)
      return;

    const response = this.gameStateMachine.curResponse;
    if (
      !response.specialSymbolGroups ||
      !response.specialSymbolGroups.some(
        (spec) => spec.type && currentConfig.specGroupTypeNames.includes(spec.type)
      )
    ) {
      return;
    }

    const groups = response.specialSymbolGroups.filter(
      (g) => g.type && currentConfig.specGroupTypeNames.includes(g.type)
    );
    for (const group of groups) {
      const pos = group.positions!.find((_) => true) ?? 0;
      if (this.valueDescriptions.has(pos)) {
        this.valueDescriptions.delete(pos);
      }
      this.valueDescriptions.set(
        pos,
        new MultiSceneIconValueDescription('icon_txt', group.totalJackPotWin, pos, group.subType)
      );
    }
  }

  public deinitialize(): void {
    super.deinitialize();
  }
}
