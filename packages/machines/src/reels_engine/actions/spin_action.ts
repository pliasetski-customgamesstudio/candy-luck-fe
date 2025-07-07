import { BuildAction } from '@cgs/shared';
import { IntervalAction, EmptyAction, SequenceAction, FunctionAction, Vector2 } from '@cgs/syd';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { ReelsEngine } from '../reels_engine';
import { ReelsSoundModel } from '../reels_sound_model';
import { GameStateMachine } from '../state_machine/game_state_machine';
import { PlaySoundAction } from './play_sound_action';
import { WaitForAction } from './wait_for_action';
import { ISpinResponse } from '@cgs/common';

export class SpinAction extends BuildAction {
  private _engine: ReelsEngine;
  get engine(): ReelsEngine {
    return this._engine;
  }
  private _regularSpinConfig: AbstractSpinConfig;
  private _freeSpinConfig: AbstractSpinConfig;
  private _sounds: ReelsSoundModel;
  protected _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _useSounds: boolean;
  get useSounds(): boolean {
    return this._useSounds;
  }

  constructor(
    engine: ReelsEngine,
    gameStateMachine: GameStateMachine<ISpinResponse>,
    regularSpinConfig: AbstractSpinConfig,
    freeSpinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    useSounds: boolean
  ) {
    super();
    this._engine = engine;
    this._gameStateMachine = gameStateMachine;
    this._regularSpinConfig = regularSpinConfig;
    this._freeSpinConfig = freeSpinConfig;
    this._sounds = sounds;
    this._useSounds = useSounds;
  }

  getSpinConfig(): AbstractSpinConfig {
    // uncomment this for using free spins config
    // if(this._gameStateMachine.curResponse.freeSpinsInfo && this._gameStateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsFinished){
    //   return this._freeSpinConfig;
    // }

    return this._regularSpinConfig;
  }

  buildAction(): IntervalAction {
    const actions: IntervalAction[] = [];
    if (this._useSounds) {
      actions.push(new PlaySoundAction(() => this.playSpinSound()));
    }

    for (let reel = 0; reel < this._engine.ReelConfig.reelCount; ++reel) {
      if (reel > 0) {
        // Don't delay first reel
        actions.push(new EmptyAction().withDuration(this.getSpinConfig().spinStartDelay));
      }
      actions.push(this.spin(reel));
    }
    actions.push(new WaitForAction(this._engine.slotsAccelerated));
    return new SequenceAction(actions);
  }

  playSpinSound(): void {
    this._sounds.startSpinSound.GoToState('sound');
  }

  spin(reel: number): IntervalAction {
    return new FunctionAction(() =>
      this._engine.accelerateReel(
        reel,
        Vector2.Zero,
        new Vector2(0.0, this.getSpinConfig().spinSpeed * this.getSpinConfig().directions[reel]),
        this.getSpinConfig().accelerationDuration
      )
    );
  }
}
