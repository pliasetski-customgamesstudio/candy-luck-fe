class FreeFallSpinActionComponent implements IStartSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameConfig: CollapseGameConfig;
  private _reelSoundModel: ReelsSoundModel;

  constructor(container: Container) {
    this._container = container;
    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._reelSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
  }

  public getStartSlotAction(spinMode: SpinMode): IntervalAction {
    return new FreeFallSpinAction(
      this._container,
      this._reelsEngine,
      this._gameConfig.regularSpinConfig,
      this._reelSoundModel,
      this._gameConfig.regularSpinCollapsingConfig
    );
  }
}
