class ModuleReelsStateProvider implements IReelsStateProvider {
  private _gameStateMachine: GameStateMachine;
  private _gameModule: BaseSlotGameModule;

  private get _spinResponse(): ModularSpinResponse {
    return this._gameStateMachine.curResponse as ModularSpinResponse;
  }

  get reelsState(): ReelState {
    return this._spinResponse.moduleReelStates[this._gameModule.moduleParams.gameId];
  }

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameModule = container.resolve(ISlotGameModule);
  }
}
