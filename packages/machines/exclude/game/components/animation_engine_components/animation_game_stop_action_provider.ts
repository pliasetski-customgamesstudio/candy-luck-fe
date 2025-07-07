class AnimationGameStopActionProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _gameEngine: AnimationBasedGameEngine;

  constructor(container: Container) {
    this._container = container;
    this._gameEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IAnimationBasedGameEngineProvider
    ).gameEngine;
  }

  getStopSlotAction(spinMode: SpinMode): Action {
    switch (spinMode) {
      case SpinMode.Spin:
        return this._gameEngine.stopAnimationAction;
      case SpinMode.ReSpin:
        return new AnimationEngineStopAfterRespinAction(this._container);
      default:
        return this._gameEngine.stopAnimationAction;
    }
  }
}
