class FreeFallStopActionComponent implements IStopSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameConfig: CollapseGameConfig;
  private _gameStateMachine: GameStateMachine;
  private _reelSoundModel: ReelsSoundModel;

  constructor(container: Container) {
    this._container = container;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
  }

  public getStopSlotAction(spinMode: SpinMode): IntervalAction {
    return new FreeFallStopAction(
      this._container,
      this._reelsEngine,
      this._gameStateMachine.curResponse.viewReels,
      this._gameConfig.regularSpinConfig,
      this._reelSoundModel,
      this._gameConfig.regularSpinCollapsingConfig
    );
  }
}
