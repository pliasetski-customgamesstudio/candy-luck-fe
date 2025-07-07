import { ListUtil } from '@cgs/shared';
import {
  IntervalAction,
  SequenceAction,
  EmptyAction,
  FunctionAction,
  Vector2,
  ParallelAction,
} from '@cgs/syd';
import { ComponentIndex } from '../entities_engine/component_index';
import { ComponentNames } from '../entity_components/component_names';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { IconDescr } from '../long_icon_enumerator';
import { ReelsEngine } from '../reels_engine';
import { ReelsSoundModel } from '../reels_sound_model';
import { GameStateMachine } from '../state_machine/game_state_machine';
import { IconAnimationHelper } from '../utils/icon_animation_helper';
import { PlaySoundAction } from './play_sound_action';
import { SpinAction } from './spin_action';
import { WaitForAction } from './wait_for_action';
import { ISpinResponse } from '@cgs/common';

export class WideIconsSpinAction extends SpinAction {
  private _iconAnimationHelper: IconAnimationHelper;
  private _drawableIndex: ComponentIndex;
  private _wideIconIds: number[];

  constructor(
    engine: ReelsEngine,
    gameStateMachine: GameStateMachine<ISpinResponse>,
    regularSpinConfig: AbstractSpinConfig,
    freeSpinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    useSounds: boolean,
    longIcons: IconDescr[]
  ) {
    super(engine, gameStateMachine, regularSpinConfig, freeSpinConfig, sounds, useSounds);
    this._drawableIndex = engine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
    this._wideIconIds = longIcons.filter((i) => i.width > 1).map((i) => i.iconIndex);
    this._iconAnimationHelper = this.engine.iconAnimationHelper;
  }

  buildAction(): IntervalAction {
    const spinActions: IntervalAction[] = [];

    if (this.useSounds) {
      spinActions.push(new PlaySoundAction(this.playSpinSound));
    }

    let startSpinDelay = 0.0;
    for (let reel = 0; reel < this.engine.internalConfig.reelCount; ++reel) {
      if (reel > 0 && !this.containsWideIcons(reel)) {
        startSpinDelay += this.getSpinConfig().spinStartDelay;
      }

      const reelCopy = reel;
      spinActions.push(
        new SequenceAction([
          new EmptyAction().withDuration(startSpinDelay),
          new FunctionAction(() =>
            this.engine.accelerateReel(
              reelCopy,
              Vector2.Zero,
              new Vector2(
                0.0,
                this.getSpinConfig().spinSpeed * this.getSpinConfig().directions[reelCopy]
              ),
              this.getSpinConfig().accelerationDuration
            )
          ),
        ])
      );
    }

    return new SequenceAction([
      new ParallelAction(spinActions),
      new WaitForAction(this.engine.slotsAccelerated),
    ]);
  }

  containsWideIcons(reel: number): boolean {
    if (reel === 0) {
      return false;
    }

    let currentReelIcons: number[] = [];
    for (let line = 0; line < this.engine.ReelConfig?.lineCount; line++) {
      currentReelIcons = ListUtil.union<number>(
        currentReelIcons,
        this._iconAnimationHelper
          .getEntities(this.engine.iconAnimationHelper.getPosition(reel, line))
          .map((e) => e.get(this._drawableIndex) as number)
          .map((i) => (i > 100 ? Math.floor(i / 100) : i))
      );
    }

    let previousReelIcons: number[] = [];
    for (let line = 0; line < this.engine.ReelConfig.lineCount; line++) {
      previousReelIcons = ListUtil.union(
        previousReelIcons,
        this._iconAnimationHelper
          .getEntities(this.engine.iconAnimationHelper.getPosition(reel - 1, line))
          .map((e) => e.get(this._drawableIndex) as number)
          .map((i) => (i > 100 ? Math.floor(i / 100) : i))
      );
    }

    return (
      this._wideIconIds.filter((i) => currentReelIcons.includes(i)).length > 0 &&
      this._wideIconIds.filter((i) => previousReelIcons.includes(i)).length > 0
    );
  }
}
