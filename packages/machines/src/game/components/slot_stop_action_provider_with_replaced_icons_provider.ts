import { SceneCommon, ISpinResponse } from '@cgs/common';
import { Container, Action } from '@cgs/syd';
import { IStopSlotActionProvider } from './i_stop_slot_action_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import {
  T_IGameConfigProvider,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { SlotStopActionWithReplacedIcons } from '../../reels_engine/slot_stop_action_with_replaced_icons';
import { StopAfterSpinActionWithIconReplacment } from '../../reels_engine/actions/stop_after_spin_action_with_icon_replacment';

enum SpinMode {
  Spin,
  ReSpin,
}

export class SlotStopActionWithReplacedIconsProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _sceneCommon: SceneCommon;
  private _regularSpinSoundModel: any;
  private _stateMachine: GameStateMachine<ISpinResponse>;
  private _config: AbstractGameConfig;
  private _uniqueReelsSymbols: number[] | null;

  private readonly _stopReelsSoundImmediately: boolean;
  private readonly _useSounds: boolean;
  private _reelsEngine: ReelsEngine;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean = true,
    uniqueReelsSymbols: number[] | null = null
  ) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._uniqueReelsSymbols = uniqueReelsSymbols;

    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    const stm = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    );
    this._stateMachine = stm.gameStateMachine;
    const gcp = this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider);
    this._config = gcp.gameConfig;
    this._reelsEngine =
      this._container.forceResolve<IReelsEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
  }

  getStopSlotAction(spinMode: SpinMode): Action {
    switch (spinMode) {
      case SpinMode.Spin:
        return new SlotStopActionWithReplacedIcons(
          this._container,
          this._reelsEngine,
          this._stateMachine.curResponse.viewReels,
          this._stateMachine.curResponse.winLines,
          this._stateMachine.curResponse.winPositions,
          this._config.regularSpinConfig,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds,
          this._uniqueReelsSymbols || []
        );
      case SpinMode.ReSpin:
        return new StopAfterSpinActionWithIconReplacment(
          this._container,
          this._reelsEngine,
          this._config.regularSpinConfig,
          this._stateMachine.curResponse,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds,
          this._uniqueReelsSymbols
        );
      default:
        return new SlotStopActionWithReplacedIcons(
          this._container,
          this._reelsEngine,
          this._stateMachine.curResponse.viewReels,
          this._stateMachine.curResponse.winLines,
          this._stateMachine.curResponse.winPositions,
          this._config.regularSpinConfig,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds,
          this._uniqueReelsSymbols || []
        );
    }
  }
}
