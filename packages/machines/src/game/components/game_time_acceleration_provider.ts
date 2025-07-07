import {
  IClientProperties,
  ISpinResponse,
  SpinAccelerationMultiplier,
  T_IClientProperties,
} from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { Container, SceneObject } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotGame,
  T_IGameConfigProvider,
  T_ISlotSessionProvider,
  T_IGameStateMachineProvider,
} from '../../type_definitions';
import { GameComponentProvider } from './game_component_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class GameTimeAccelerationProvider extends GameComponentProvider {
  INITIAL_MULTIPLIER: string = '1';
  INITIAL_TIME_SCALE: string = '1';

  private _container: Container;
  private _clientProperties: IClientProperties;
  private _gameConfig: AbstractGameConfig;
  private _game: SceneObject;
  private _gameId: string;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _isFastSpinsActive: boolean = false;

  get spinSpeedValue(): number {
    const isSpeedMultiplierEnabled: boolean = this._clientProperties.get(
      SpinAccelerationMultiplier.enabled,
      false
    );

    const spinSpeedMultiplierProp: string = this._clientProperties.get(
      SpinAccelerationMultiplier.enabledPerSlot,
      this.INITIAL_MULTIPLIER
    );
    return this.isFastSpinsEnabled
      ? this._getValueFromPropertyString(
          this._gameId,
          spinSpeedMultiplierProp,
          isSpeedMultiplierEnabled,
          this.INITIAL_MULTIPLIER
        ) / 100
      : 1.0;
  }

  get isFastSpinsActive(): boolean {
    return (
      this._isFastSpinsActive &&
      !this._gameStateMachine.curResponse.isBonus &&
      !this._gameStateMachine.curResponse.isScatter &&
      (this._gameStateMachine.isAutoSpins ||
        (!!this._gameStateMachine.curResponse.freeSpinsInfo &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event !==
            FreeSpinsInfoConstants.FreeSpinsStarted))
    );
  }
  set isFastSpinsActive(value: boolean) {
    this._isFastSpinsActive = value;
  }
  get isFastSpinsEnabled(): boolean {
    return this._isFastSpinsActive;
  }

  constructor(container: Container) {
    super();
    this._container = container;
    this._clientProperties = this._container.forceResolve<IClientProperties>(T_IClientProperties);
    this._game = this._container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._gameId =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession.GameId;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  trySetNewValues(): void {
    // const timeScaleProp: string = this._clientProperties.get(FeaturesParams.GameTimeAcceleration, this.INITIAL_TIME_SCALE);
    // this._game.timeScale = this._getValueFromPropertyString(this._gameId, timeScaleProp, this.INITIAL_TIME_SCALE);

    const spinSpeedMultiplierProp: string = this._clientProperties.get(
      SpinAccelerationMultiplier.enabledPerSlot,
      this.INITIAL_MULTIPLIER
    );
    const isSpeedMultiplierEnabled: boolean = this._clientProperties.get(
      SpinAccelerationMultiplier.enabled,
      false
    );
    // const newSpinSpeedMultiplier: number = this._getValueFromPropertyString(this._gameId, spinSpeedMultiplierProp, isSpeedMultiplierEnabled, this.INITIAL_MULTIPLIER);
    const newSpinSpeedMultiplier: number = 600;
    this._isFastSpinsActive = true;
    this._setSpinSpeedValues(newSpinSpeedMultiplier / 100);
  }

  isFastSpeedAvailable(): boolean {
    const spinSpeedMultiplierProp: string = this._clientProperties.get(
      SpinAccelerationMultiplier.enabledPerSlot,
      this.INITIAL_MULTIPLIER
    );
    const isSpeedMultiplierEnabled: boolean = this._clientProperties.get(
      SpinAccelerationMultiplier.enabled,
      false
    );
    const newSpinSpeedMultiplier: number = Math.round(
      this._getValueFromPropertyString(
        this._gameId,
        spinSpeedMultiplierProp,
        isSpeedMultiplierEnabled,
        this.INITIAL_MULTIPLIER
      )
    );

    return newSpinSpeedMultiplier != parseInt(this.INITIAL_MULTIPLIER);
  }

  resetGameTimeScale(): void {
    // this._game.timeScale = parseFloat(this.INITIAL_TIME_SCALE);
    this._isFastSpinsActive = false;
    this._setSpinSpeedValues(parseFloat(this.INITIAL_MULTIPLIER));
  }

  deinitialize(): void {
    this.resetGameTimeScale();
    super.deinitialize();
  }

  private _getValueFromPropertyString(
    gameId: string,
    propertyString: string,
    isEnabled: boolean,
    defaultValue: string
  ): number {
    if (!StringUtils.isNullOrEmpty(propertyString)) {
      let newValue = parseFloat(propertyString);
      // if (isNaN(newValue)) {
      //   const exp: RegExp = new RegExp(r"(\b\d+):(\d+(?:\.\d+)?\b)");
      //   const matches: RegExpMatchArray = exp.allMatches(propertyString);
      //   const match: RegExpMatch | null = matches.firstWhere((m: RegExpMatch) => m.group(1) == gameId, { orElse: () => null });
      //   newValue = parseFloat(match && isEnabled ? match.group(2) : defaultValue);
      // }
      return newValue;
    }

    return parseFloat(defaultValue);
  }

  private _setSpinSpeedValues(value: number): void {
    this._gameConfig.regularSpinConfig.speedMultiplier = value;
    this._gameConfig.freeSpinConfig.speedMultiplier = value;
    this._gameConfig.giftSpinConfig.speedMultiplier = value;
    this._gameConfig.anticipationConfig.speedMultiplier = value;
    // if (this._gameConfig instanceof CollapseGameConfig) {
    //   const collapseGameConfig: CollapseGameConfig = this._gameConfig as CollapseGameConfig;
    //   collapseGameConfig.regularSpinCollapsingConfig.collapsingParameters.spinSpeedMultiplier = value;
    //   collapseGameConfig.freeSpinCollapsingConfig.collapsingParameters.spinSpeedMultiplier = value;
    // }
  }
}
