class StopSlotModuleActionProvider implements IStopSlotActionProvider {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _gameConfig: AbstractGameConfig;
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  private _gameStateMachine: GameStateMachine;
  private _stopReelsSoundImmediately: boolean;
  private _moduleId: string;
  private readonly _useSounds: boolean;

  get spinResponse(): ModularSpinResponse {
    return this._gameStateMachine.curResponse as ModularSpinResponse;
  }

  constructor(
    container: Container,
    stopReelsSoundImmediately: boolean,
    moduleId: string,
    useSounds: boolean = false
  ) {
    this._container = container;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._moduleId = moduleId;
    this._useSounds = useSounds;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
  }

  getStopSlotAction(spinMode: SpinMode): IntervalAction {
    switch (spinMode) {
      case SpinMode.Spin:
        return new StopAction(
          this._reelsEngine,
          this.spinResponse.moduleReelStates[this._moduleId].viewReels,
          this.spinResponse.moduleReelStates[this._moduleId].winLines,
          this.spinResponse.moduleReelStates[this._moduleId].winPositions,
          this._gameConfig.regularSpinConfig,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds
        );
      case SpinMode.ReSpin:
        return new StopAfterRespinAction(
          this._container,
          this._reelsEngine,
          this._gameConfig.regularSpinConfig,
          this._gameStateMachine.curResponse,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds
        );
      default:
        return new StopAction(
          this._reelsEngine,
          this.spinResponse.moduleReelStates[this._moduleId].viewReels,
          this.spinResponse.moduleReelStates[this._moduleId].winLines,
          this.spinResponse.moduleReelStates[this._moduleId].winPositions,
          this._gameConfig.regularSpinConfig,
          this._regularSpinSoundModel,
          this._stopReelsSoundImmediately,
          this._useSounds
        );
    }
  }
}
