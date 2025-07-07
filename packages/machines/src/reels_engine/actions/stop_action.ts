import { BuildAction } from '@cgs/shared';
import { Action, IntervalAction, EmptyAction, SequenceAction, FunctionAction } from '@cgs/syd';
import { WaitForAction } from './wait_for_action';
import { ReelsEngine } from '../reels_engine';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { ReelsSoundModel } from '../reels_sound_model';
import { Line, ReelWinPosition } from '@cgs/common';

export class StopAction extends BuildAction {
  private _engine: ReelsEngine;
  get engine(): ReelsEngine {
    return this._engine;
  }
  private _winTapes: number[][];
  get winTapes(): number[][] {
    return this._winTapes;
  }
  private _spinConfig: AbstractSpinConfig;
  get spinConfig(): AbstractSpinConfig {
    return this._spinConfig;
  }
  private _sounds: ReelsSoundModel;
  get sounds(): ReelsSoundModel {
    return this._sounds;
  }
  private _useSounds: boolean;
  get useSounds(): boolean {
    return this._useSounds;
  }
  private _winLines: Line[];
  get winLines(): Line[] {
    return this._winLines;
  }
  private _winPositions: ReelWinPosition[];
  get winPositions(): ReelWinPosition[] {
    return this._winPositions;
  }
  private _stopReelsSoundImmediately: boolean;
  get stopReelsSoundImmediately(): boolean {
    return this._stopReelsSoundImmediately;
  }

  constructor(
    engine: ReelsEngine,
    winTapes: number[][],
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean
  ) {
    super();
    this._engine = engine;
    this._winTapes = winTapes;
    this._spinConfig = spinConfig;
    this._sounds = sounds;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    this._winLines = winLines || [];
  }

  buildAction(): Action {
    this._engine.slotsStoped.first.then((s) => this.slotStopped(s));
    const actions: IntervalAction[] = [];
    for (let reel = 0; reel < this._engine.ReelConfig.reelCount; ++reel) {
      if (reel > 0) {
        actions.push(new EmptyAction().withDuration(this._spinConfig.spinStopDelay));
      }
      actions.push(this.stop(reel, this._winTapes[reel]));
    }
    const waitForAction = new WaitForAction(this._engine.slotsStoped);
    waitForAction.subscribe();
    actions.push(waitForAction);
    return new SequenceAction(actions);
  }

  slotStopped(_param: any): void {
    if (this._useSounds) {
      if (
        this._stopReelsSoundImmediately ||
        this._winLines.length > 0 ||
        (this._winPositions && this._winPositions.length > 0)
      ) {
        this._sounds.startSpinSound.GoToState('stop_sound');
      } else {
        this._sounds.startSpinSound.GoToState('fade_out');
      }
    }
  }

  stop(reel: number, winTapes: number[]): IntervalAction {
    return new FunctionAction(() => this._engine.stop(reel, winTapes));
  }
}
