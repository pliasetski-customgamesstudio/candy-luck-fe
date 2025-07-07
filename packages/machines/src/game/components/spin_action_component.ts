import { ISpinResponse } from '@cgs/common';
import { Container, IntervalAction } from '@cgs/syd';
import { RespinAction } from '../../reels_engine/actions/respin_action';
import { SpinAction } from '../../reels_engine/actions/spin_action';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { RegularSpinsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_IGameConfigProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { IStartSlotActionProvider, SpinMode } from './i_start_slot_action_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';

export class SpinActionComponent implements IStartSlotActionProvider {
  private _container: Container;
  get container(): Container {
    return this._container;
  }
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _reelsEngine: ReelsEngine;
  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  private _gameConfig: AbstractGameConfig;
  get gameConfig(): AbstractGameConfig {
    return this._gameConfig;
  }
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  get regularSpinSoundModel(): RegularSpinsSoundModel {
    return this._regularSpinSoundModel;
  }
  private readonly _useSounds: boolean;
  get useSounds(): boolean {
    return this._useSounds;
  }

  constructor(container: Container, useSounds: boolean = true) {
    this._container = container;
    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._gameStateMachine = (
      this._container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel as RegularSpinsSoundModel;
    this._useSounds = useSounds;
  }

  getStartSlotAction(spinMode: SpinMode): IntervalAction {
    switch (spinMode) {
      case SpinMode.Spin:
        return new SpinAction(
          this._reelsEngine,
          this._gameStateMachine,
          this._gameConfig.regularSpinConfig,
          this._gameConfig.freeSpinConfig,
          this._regularSpinSoundModel,
          this._useSounds
        );
      case SpinMode.ReSpin:
        return new RespinAction(
          this._container,
          this._reelsEngine,
          this._gameStateMachine,
          this._gameConfig.regularSpinConfig,
          this._gameConfig.freeSpinConfig,
          this._regularSpinSoundModel,
          this._useSounds
        );
      default:
        return new SpinAction(
          this._reelsEngine,
          this._gameStateMachine,
          this._gameConfig.regularSpinConfig,
          this._gameConfig.freeSpinConfig,
          this._regularSpinSoundModel,
          this._useSounds
        );
    }
  }
}
