import { ISpinResponse } from '@cgs/common';
import { Container, IntervalAction } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_RegularSpinsSoundModelComponent,
  T_IGameConfigProvider,
} from '../../type_definitions';
import { CustomSpinAction } from './custom_spin_action';
import { IStartSlotActionProvider, SpinMode } from './i_start_slot_action_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';

export class CustomSpinActionProvider implements IStartSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _regularSpinSoundModel: ReelsSoundModel;
  private _config: AbstractGameConfig;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _useSounds: boolean;

  constructor(container: Container, useSounds: boolean = true) {
    this._container = container;
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._gameStateMachine = (
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    this._regularSpinSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel as ReelsSoundModel;
    this._config = (
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider) as IGameConfigProvider
    ).gameConfig;
    this._useSounds = useSounds;
  }

  public getStartSlotAction(spinMode: SpinMode): IntervalAction {
    return new CustomSpinAction(
      this._reelsEngine,
      this._gameStateMachine,
      this._config.regularSpinConfig,
      this._config.freeSpinConfig,
      this._regularSpinSoundModel,
      this._useSounds
    );
  }
}
