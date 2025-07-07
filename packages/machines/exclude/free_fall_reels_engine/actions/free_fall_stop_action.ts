class FreeFallStopAction extends BuildAction {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _winTapes: number[][];
  private _spinConfig: AbstractSpinConfig;
  private _collapsingSpinConfig: CollapsingSpinConfig;
  private _reelSounds: ReelsSoundModel;
  private _freeFallDelayLogicProvider: IFreeFallDelayLogicProvider;
  private _reelsDelay: number[];

  constructor(
    container: Container,
    reelsEngine: ReelsEngine,
    winTapes: number[][],
    spinConfig: AbstractSpinConfig,
    reelSounds: ReelsSoundModel,
    collapsingSpinConfig: CollapsingSpinConfig
  ) {
    super();
    this._container = container;
    this._reelsEngine = reelsEngine;
    this._winTapes = winTapes;
    this._spinConfig = spinConfig;
    this._reelSounds = reelSounds;
    this._collapsingSpinConfig = collapsingSpinConfig;
  }

  get freeFallDelayLogicProvider(): IFreeFallDelayLogicProvider {
    if (!this._freeFallDelayLogicProvider) {
      this._freeFallDelayLogicProvider = this._container.resolve(IFreeFallDelayLogicProvider);
    }
    return this._freeFallDelayLogicProvider;
  }

  buildAction(): IntervalAction {
    const actions: IntervalAction[] = [];
    this._reelsDelay = this.freeFallDelayLogicProvider.getReelFallDelay();

    actions.push(new StopSoundAction(this._reelSounds.getSoundByName('fallingSound')));
    actions.push(new PlaySoundAction(this._reelSounds.getSoundByName('fallingSound')));

    for (let reel = 0; reel < this._reelsEngine.ReelConfig.reelCount; ++reel) {
      actions.push(this._stop(reel, this._winTapes[reel]));
    }
    actions.push(new WaitForAction(this._reelsEngine.slotsStoped));
    return new ParallelAction(actions);
  }

  private _stop(reel: number, winTapes: number[]): IntervalAction {
    const actions: IntervalAction[] = [];
    actions.push(new EmptyAction().withDuration(this._reelsDelay[reel]));

    for (let line = this._reelsEngine.ReelConfig.lineCount - 1; line >= 0; --line) {
      actions.push(
        new FunctionAction(() => this._reelsEngine.stopEntity(reel, line, winTapes[line]))
      );
      actions.push(
        new EmptyAction().withDuration(
          this._collapsingSpinConfig.collapsingParameters.iconOutgoingStartDelay
        )
      );
    }

    return new SequenceAction(actions);
  }
}
