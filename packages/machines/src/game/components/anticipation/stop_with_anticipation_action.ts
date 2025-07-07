import { Line, ReelWinPosition, ISpinResponse } from '@cgs/common';
import { BuildAction } from '@cgs/shared';
import {
  Container,
  Action,
  EmptyAction,
  FunctionAction,
  SequenceSimpleAction,
  IntervalAction,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AnticipationConfig } from '../../../reels_engine/game_config/game_config';
import { LongStoppingIconEnumerator } from '../../../reels_engine/long_stopping_icons_enumerator';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotGameEngineProvider,
  T_IGameConfigProvider,
  T_IGameStateMachineProvider,
  T_AnticipationAnimationProvider,
} from '../../../type_definitions';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { WaitForAction } from '../win_lines/complex_win_line_actions/wait_for_action';
import { AnticipationAnimationProvider } from './anticipation_animation_provider';

export class StopWithAnticipationAction extends BuildAction {
  private _reelsEngine: ReelsEngine;
  private _winTapes: number[][];
  private _winLines: Line[];
  private _winPositions: ReelWinPosition[];
  private _spinStopDelay: number;
  private _reelSounds: ReelsSoundModel;
  private _anticipationAnimationProvider: AnticipationAnimationProvider;
  private _container: Container;
  private _stopReelsSoundImmediately: boolean;
  private _anticipationConfig: AnticipationConfig;
  private readonly _useSounds: boolean;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconEnumerator: LongStoppingIconEnumerator | null;

  constructor(
    container: Container,
    winTapes: number[][],
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinStopDelay: number,
    reelSounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean
  ) {
    super();
    this._container = container;
    this._winTapes = winTapes;
    this._winLines = winLines;
    this._winPositions = winPositions;
    this._spinStopDelay = spinStopDelay;
    this._reelSounds = reelSounds;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._anticipationConfig = this._container.forceResolve<IGameConfigProvider>(
      T_IGameConfigProvider
    ).gameConfig.anticipationConfig as AnticipationConfig;
    this._anticipationAnimationProvider =
      this._container.forceResolve<AnticipationAnimationProvider>(T_AnticipationAnimationProvider);
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._iconEnumerator =
      this._reelsEngine.iconsEnumerator instanceof LongStoppingIconEnumerator
        ? (this._reelsEngine.iconsEnumerator as LongStoppingIconEnumerator)
        : null;
    if (!this._winLines) {
      this._winLines = [];
    }
    if (this._iconEnumerator) {
      this._gameStateMachine.accelerate.entered.listen((_e) => {
        if (this._iconEnumerator) {
          this._iconEnumerator.isStopping = false;
        }
      });
    }
  }

  buildAction(): Action {
    this._reelsEngine.slotsStoped.first.then((s) => this._onSlotStopped(s));
    const actions: Action[] = [];
    if (this._iconEnumerator) {
      this._iconEnumerator.isStopping = true;
    }
    for (let reel = 0; reel < this._reelsEngine.internalConfig.reelCount; ++reel) {
      if (reel > 0) {
        actions.push(new EmptyAction().withDuration(this._spinStopDelay));
      }
      actions.push(this._stop(reel, this._winTapes[reel]));
      if (this._anticipationAnimationProvider) {
        actions.push(this._anticipationAnimationProvider.AnticipationAction(reel));
      }
    }
    const act = new WaitForAction<void>(this._reelsEngine.slotsStoped);
    act.subscribe();
    actions.push(act);
    actions.push(
      new FunctionAction(() => {
        for (let i = 0; i < this._anticipationConfig.anticipationIcons.length; i++) {
          const symbolId = this._anticipationConfig.anticipationIcons[i];
          for (const reel of this._anticipationConfig.anticipationReels[i]) {
            this._reelSounds.anticipatorSound(symbolId, reel).GoToState('default');
          }
        }
      })
    );
    return new SequenceSimpleAction(actions);
  }

  private _stop(reel: number, winTapes: number[]): IntervalAction {
    return new FunctionAction(() => this._reelsEngine.stop(reel, winTapes));
  }

  private _onSlotStopped(_o: any): void {
    if (this._useSounds) {
      if (
        this._stopReelsSoundImmediately ||
        this._winLines.length > 0 ||
        (this._winPositions && this._winPositions.length > 0)
      ) {
        this._reelSounds.startSpinSound.GoToState('stop_sound');
      } else {
        this._reelSounds.startSpinSound.GoToState('fade_out');
      }
    }
    if (this._anticipationAnimationProvider) {
      this._anticipationAnimationProvider.ClearSymbols();
      this._anticipationAnimationProvider.stopAccelerationSound();
    }
  }
}
