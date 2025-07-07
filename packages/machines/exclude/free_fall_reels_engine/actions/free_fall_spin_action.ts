import {
  ReelsEngine,
  AbstractSpinConfig,
  CollapsingSpinConfig,
  ReelsSoundModel,
  IFreeFallDelayLogicProvider,
  Container,
  IntervalAction,
  List,
  StopSoundAction,
  PlaySoundAction,
  WaitForAction,
  ParallelAction,
  EmptyAction,
  FunctionAction,
  Vector2,
  SequenceAction,
} from 'machines';
import { IFreeFallDelayLogicProvider } from 'machines/src/reels_engine_library';

class FreeFallSpinAction extends BuildAction {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _spinConfig: AbstractSpinConfig;
  private _collapsingSpinConfig: CollapsingSpinConfig;
  private _reelSounds: ReelsSoundModel;
  private _freeFallDelayLogicProvider: IFreeFallDelayLogicProvider;
  private _reelsDelay: List<number>;

  get freeFallDelayLogicProvider(): IFreeFallDelayLogicProvider {
    if (!this._freeFallDelayLogicProvider) {
      this._freeFallDelayLogicProvider = this._container.resolve(IFreeFallDelayLogicProvider);
    }

    return this._freeFallDelayLogicProvider;
  }

  constructor(
    container: Container,
    reelsEngine: ReelsEngine,
    spinConfig: AbstractSpinConfig,
    reelSounds: ReelsSoundModel,
    collapsingSpinConfig: CollapsingSpinConfig
  ) {
    super();
    this._container = container;
    this._reelsEngine = reelsEngine;
    this._spinConfig = spinConfig;
    this._reelSounds = reelSounds;
    this._collapsingSpinConfig = collapsingSpinConfig;
  }

  buildAction(): IntervalAction {
    const actions: List<IntervalAction> = [];
    this._reelsDelay = this.freeFallDelayLogicProvider.getReelFallDelay();

    actions.push(new StopSoundAction(this._reelSounds.getSoundByName('outgoingSound')));
    actions.push(new PlaySoundAction(this._reelSounds.getSoundByName('outgoingSound')));

    for (let reel = 0; reel < this._reelsEngine.ReelConfig.reelCount; ++reel) {
      actions.push(this._spin(reel));
    }
    actions.push(new WaitForAction(this._reelsEngine.slotsAccelerated));
    return new ParallelAction(actions);
  }

  private _spin(reel: number): IntervalAction {
    const actions: List<IntervalAction> = [];
    actions.push(new EmptyAction().withDuration(this._reelsDelay[reel]));

    for (let line = this._reelsEngine.ReelConfig.lineCount - 1; line >= 0; --line) {
      actions.push(
        new FunctionAction(() =>
          this._reelsEngine.accelerateEntity(
            reel,
            line,
            Vector2.Zero,
            new Vector2(0.0, this._spinConfig.spinSpeed),
            this._spinConfig.accelerationDuration
          )
        )
      );
      actions.push(
        new EmptyAction().withDuration(
          this._collapsingSpinConfig.collapsingParameters.iconFallingStartDelay
        )
      );
    }

    return new SequenceAction(actions);
  }
}
