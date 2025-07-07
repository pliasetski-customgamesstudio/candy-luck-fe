import { Container, IntervalAction } from '@cgs/syd';
import { StopAction } from '../../reels_engine/actions/stop_action';
import { StopAfterRespinAction } from '../../reels_engine/actions/stop_after_respin_action';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { RegularSpinsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_IGameConfigProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { SpinMode } from './i_start_slot_action_provider';
import { IStopSlotActionProvider } from './i_stop_slot_action_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ISpinResponse } from '@cgs/common';

export class StopActionComponent implements IStopSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameConfig: AbstractGameConfig;
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _stopReelsSoundImmediately: boolean;
  private readonly _useSounds: boolean;

  constructor(container: Container, stopReelsSoundImmediately: boolean, useSounds: boolean = true) {
    this._container = container;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
  }

  public getStopSlotAction(spinMode: SpinMode): IntervalAction {
    switch (spinMode) {
      case SpinMode.Spin:
        return new StopAction(
          this._reelsEngine,
          this._gameStateMachine.curResponse.viewReels,
          this._gameStateMachine.curResponse.winLines,
          this._gameStateMachine.curResponse.winPositions,
          this._gameConfig.regularSpinConfig,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds
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
        return new StopAction(
          this._reelsEngine,
          this._gameStateMachine.curResponse.viewReels,
          this._gameStateMachine.curResponse.winLines,
          this._gameStateMachine.curResponse.winPositions,
          this._gameConfig.regularSpinConfig,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds
        );
    }
  }
}
