import { IntervalAction, EmptyAction, SequenceAction } from '@cgs/syd';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { IconDescr } from '../long_icon_enumerator';
import { ReelsEngine } from '../reels_engine';
import { ReelsSoundModel } from '../reels_sound_model';
import { StopAction } from './stop_action';
import { WaitForAction } from './wait_for_action';
import { Line, ReelWinPosition } from '@cgs/common';

export class WideIconsStopAction extends StopAction {
  private _wideIcons: IconDescr[];

  constructor(
    engine: ReelsEngine,
    winTapes: number[][],
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean,
    longIcons: IconDescr[]
  ) {
    super(
      engine,
      winTapes,
      winLines,
      winPositions,
      spinConfig,
      sounds,
      stopReelsSoundImmediately,
      useSounds
    );
    this._wideIcons = longIcons.filter((descr) => descr.width > 1);
  }

  buildAction(): IntervalAction {
    this.engine.slotsStoped.first.then((s) => this.slotStopped(s));

    const reelsWithWideIcons: number[][] = [];
    for (let reelIndex = 0; reelIndex < this.winTapes.length; reelIndex++) {
      const reel = this.winTapes[reelIndex];
      for (let lineIndex = 0; lineIndex < reel.length; lineIndex++) {
        const iconId = reel[lineIndex];
        if (iconId > 100) {
          const wideIcon = this._wideIcons.find(
            (descr) => descr.iconIndex === Math.floor(iconId / 100)
          );
          if (wideIcon && iconId % 100 < wideIcon.length) {
            reelsWithWideIcons.push(
              Array.from({ length: wideIcon.width }, (_, i) => reelIndex + i)
            );
          }
        }
      }
    }

    const actions: IntervalAction[] = [];
    for (let reel = 0; reel < this.engine.ReelConfig.reelCount; ++reel) {
      const haveWideIcon = reelsWithWideIcons.some((reels) => reels.includes(reel));
      const firstWideIcon = reelsWithWideIcons.some((reels) => reels[0] === reel);
      const lastWideIcon = reelsWithWideIcons.some((reels) => reels[reels.length - 1] === reel);
      let action: IntervalAction;
      if (firstWideIcon) {
        action = new EmptyAction().withDuration(this.spinConfig.spinStopDelay);
      } else if (haveWideIcon) {
        action = new EmptyAction();
      } else {
        action = new EmptyAction().withDuration(this.spinConfig.spinStopDelay);
      }
      actions.push(action);
      actions.push(this.stop(reel, this.winTapes[reel]));
    }
    actions.push(new WaitForAction(this.engine.slotsStoped));
    return new SequenceAction(actions);
  }
}
