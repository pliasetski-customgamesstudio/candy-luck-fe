import { ISpinResponse } from '@cgs/common';
import { Container, Action } from '@cgs/syd';
import { AbstractGameConfig } from '../../../reels_engine/game_config/abstract_game_config';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { SpinMode } from '../i_start_slot_action_provider';
import { IStopSlotActionProvider } from '../i_stop_slot_action_provider';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { StopWithAnticipationAction } from './stop_with_anticipation_action';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_RegularSpinsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_IGameConfigProvider,
} from '../../../type_definitions';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';

export class AnticipationStopSlotActionProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _regularSpinSoundModel: ReelsSoundModel;
  private _stateMachine: GameStateMachine<ISpinResponse>;
  private _config: AbstractGameConfig;
  private readonly _stopReelsSoundImmediately: boolean;
  private readonly _useSounds: boolean;

  constructor(container: Container, stopReelsSoundImmediately: boolean, useSounds: boolean = true) {
    this._container = container;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._stateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._config =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
  }

  getStopSlotAction(_spinMode: SpinMode): Action {
    return new StopWithAnticipationAction(
      this._container,
      this._stateMachine.curResponse.viewReels,
      this._stateMachine.curResponse.winLines,
      this._stateMachine.curResponse.winPositions,
      this._config.regularSpinConfig.spinStopDelay,
      this._regularSpinSoundModel,
      this._stopReelsSoundImmediately,
      this._useSounds
    );
  }
}
