import { Container, IntervalAction } from '@cgs/syd';
import { IStopSlotActionProvider } from './i_stop_slot_action_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { AbstractGameConfig } from '../../reels_engine/game_config/abstract_game_config';
import { RegularSpinsSoundModel } from '../../reels_engine/reels_sound_model';
import { ISpinResponse } from '@cgs/common';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { IconDescr } from '../../reels_engine/long_icon_enumerator';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameConfigProvider,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { SlotParams } from '../../reels_engine/slot_params';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { SpinMode } from './i_start_slot_action_provider';
import { WideIconsStopAction } from '../../reels_engine/actions/wide_icons_stop_action';
import { StopWithAnticipationAction } from './anticipation/stop_with_anticipation_action';
import { StopAction } from '../../reels_engine/actions/stop_action';

export class StopActionKind {
  static readonly regularStopAction: string = 'regularStopAction';
  static readonly stopWithAnticipationAction: string = 'stopWithAnticipationAction';
  static readonly wideIconsStopAction: string = 'wideIconsStopAction';
}

export class WideIconsStopActionProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameConfig: AbstractGameConfig;
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _actionTypesPriority: string[];
  private _stopReelsSoundImmediately: boolean;
  private readonly _useSounds: boolean;
  private _longIcons: IconDescr[];

  constructor(
    container: Container,
    actionTypesPriority: string[],
    stopReelsSoundImmediately: boolean,
    useSounds: boolean = true
  ) {
    this._container = container;
    this._actionTypesPriority = actionTypesPriority;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine =
      this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._longIcons = (
      this._container.forceResolve<IGameParams>(T_IGameParams) as SlotParams
    ).longIcons;
  }

  getStopSlotAction(spinMode: SpinMode): IntervalAction {
    for (let actionKind of this._actionTypesPriority) {
      switch (actionKind) {
        case StopActionKind.wideIconsStopAction:
          let icons: number[] = [];
          this._gameStateMachine.curResponse.viewReels.forEach((reel) =>
            icons.push(...reel.map((icon) => Math.floor(icon / 100)))
          );
          if (
            icons.some((icon) =>
              this._longIcons.some((longIcon) => longIcon.width > 1 && longIcon.iconIndex === icon)
            )
          ) {
            return new WideIconsStopAction(
              this._reelsEngine,
              this._gameStateMachine.curResponse.viewReels,
              this._gameStateMachine.curResponse.winLines,
              this._gameStateMachine.curResponse.winPositions,
              this._gameConfig.regularSpinConfig,
              this._regularSpinSoundModel,
              this._stopReelsSoundImmediately,
              this._useSounds,
              this._longIcons
            );
          }
          break;
        case StopActionKind.stopWithAnticipationAction:
          return new StopWithAnticipationAction(
            this._container,
            this._gameStateMachine.curResponse.viewReels,
            this._gameStateMachine.curResponse.winLines,
            this._gameStateMachine.curResponse.winPositions,
            this._gameConfig.regularSpinConfig.spinStopDelay,
            this._regularSpinSoundModel,
            this._stopReelsSoundImmediately,
            this._useSounds
          );
      }
    }

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
