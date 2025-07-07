import { IntervalAction, EmptyAction, SequenceAction, FunctionAction, Vector2 } from '@cgs/syd';
import { PlaySoundAction } from '../../reels_engine/actions/play_sound_action';
import { SpinAction } from '../../reels_engine/actions/spin_action';
import { AbstractSpinConfig } from '../../reels_engine/game_config/abstract_spin_config';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ConditionIntervalAction } from './win_lines/complex_win_line_actions/condition_action';
import { ISpinResponse } from '@cgs/common';

export class CustomSpinAction extends SpinAction {
  constructor(
    engine: ReelsEngine,
    gameStateMachine: GameStateMachine<ISpinResponse>,
    regularSpinConfig: AbstractSpinConfig,
    freeSpinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    useSounds: boolean
  ) {
    super(engine, gameStateMachine, regularSpinConfig, freeSpinConfig, sounds, useSounds);
    this._gameStateMachine = gameStateMachine;
  }

  buildAction(): IntervalAction {
    const actions: IntervalAction[] = [];
    if (this.useSounds) {
      actions.push(new PlaySoundAction(this.playSpinSound));
    }

    for (let reel = 0; reel < this.engine.ReelConfig.reelCount; ++reel) {
      if (reel > 0) {
        actions.push(new EmptyAction().withDuration(this.getSpinConfig().spinStartDelay));
      }
      actions.push(this.spin(reel));
    }
    actions.push(new EmptyAction().withDuration(1.5));
    actions.push(
      new ConditionIntervalAction(() => this.engine.isSlotAccelerated).withDuration(4.0)
    );
    return new SequenceAction(actions);
  }

  spin(reel: number): IntervalAction {
    const actions: IntervalAction[] = [];
    if (
      this._gameStateMachine.curResponse.isFreeSpins &&
      this._gameStateMachine.curResponse.freeSpinsInfo!.event !==
        FreeSpinsInfoConstants.FreeSpinsFinished &&
      this._gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.name ===
        'freeRespin' &&
      this._gameStateMachine.curResponse.specialSymbolGroups &&
      this._gameStateMachine.curResponse.specialSymbolGroups.some(
        (x) => x.type === 'RespinPositions'
      )
    ) {
      const group = this._gameStateMachine.curResponse.specialSymbolGroups.find(
        (x) => x.type === 'RespinPositions'
      );
      const positions = group!.positions!;
      for (const pos of positions) {
        const reelIndex = pos % this.engine.ReelConfig.reelCount;
        const lineIndex = Math.floor(pos / this.engine.ReelConfig.reelCount);
        if (reelIndex === reel) {
          actions.push(
            new FunctionAction(() =>
              this.engine.accelerateSpinningEntity(
                reelIndex,
                lineIndex,
                new Vector2(0.0, 0.0),
                new Vector2(
                  0.0,
                  this.getSpinConfig().singleEntitySpinSpeed *
                    0.8 *
                    this.getSpinConfig().directions[reel]
                ),
                this.getSpinConfig().accelerationDuration
              )
            )
          );
        }
      }

      if (actions.length <= 0) {
        actions.push(new EmptyAction());
      }
    } else {
      if (reel > 0) {
        actions.push(new EmptyAction().withDuration(this.getSpinConfig().spinStartDelay));
      }

      actions.push(
        new FunctionAction(() =>
          this.engine.accelerateReel(
            reel,
            new Vector2(0.0, 0.0),
            new Vector2(
              0.0,
              this.getSpinConfig().spinSpeed * this.getSpinConfig().directions[reel]
            ),
            this.getSpinConfig().accelerationDuration
          )
        )
      );
    }
    return new SequenceAction(actions);
  }
}
