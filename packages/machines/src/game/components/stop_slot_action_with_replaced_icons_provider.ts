import { Container, IntervalAction } from '@cgs/syd';
import { StopAfterRespinAction } from '../../reels_engine/actions/stop_after_respin_action';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { RegularSpinsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { SpinMode } from './i_start_slot_action_provider';
import { IStopSlotActionProvider } from './i_stop_slot_action_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { StopWithReplacedIconsAction } from './stop_with_replaced_icons_action';
import { ISpinResponse } from '@cgs/common';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_IGameConfigProvider,
  T_RegularSpinsSoundModelComponent,
  T_IReelsEngineProvider,
} from '../../type_definitions';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';

export class StopSlotActionWithReplacedIconsProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameConfig: AbstractGameConfig;
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _stopReelsSoundImmediately: boolean;
  private readonly _useSounds: boolean;

  private _skipFsTypes: string[];
  private _customFsReplace: string[];
  private _customReplaceId: number;

  constructor(
    container: Container,
    stopReelsSoundImmediately: boolean,
    skipFsTypes: string[],
    customFsReplace: string[],
    customReplaceId: number,
    useSounds: boolean = true
  ) {
    this._container = container;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine =
      this._container.forceResolve<IReelsEngineProvider>(T_IReelsEngineProvider).reelsEngine;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._skipFsTypes = skipFsTypes;
    this._customReplaceId = customReplaceId;
    this._customFsReplace = customFsReplace;
  }

  getStopSlotAction(spinMode: SpinMode): IntervalAction {
    switch (spinMode) {
      case SpinMode.Spin:
        return new StopWithReplacedIconsAction(
          this._container,
          this._reelsEngine,
          this._gameStateMachine.curResponse.viewReels,
          this._gameStateMachine.curResponse.winLines,
          this._gameStateMachine.curResponse.winPositions,
          this._gameConfig.regularSpinConfig.spinStopDelay,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds,
          this._skipFsTypes,
          this._customFsReplace,
          this._customReplaceId
        );
      case SpinMode.ReSpin:
        return new StopAfterRespinAction(
          this._container,
          this._reelsEngine,
          this._gameConfig.regularSpinConfig,
          this._gameStateMachine.curResponse,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds
        );
      default:
        return new StopWithReplacedIconsAction(
          this._container,
          this._reelsEngine,
          this._gameStateMachine.curResponse.viewReels,
          this._gameStateMachine.curResponse.winLines,
          this._gameStateMachine.curResponse.winPositions,
          this._gameConfig.regularSpinConfig.spinStopDelay,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds,
          this._skipFsTypes,
          this._customFsReplace,
          this._customReplaceId
        );
    }
  }
}
