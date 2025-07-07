class SlotModulePrimaryActionsProvider implements ISlotPrimaryActionsProvider {
  private _winLineComponent: WinLineActionComponent;
  private _gameStateMachine: IGameStateMachineProvider;
  private _gameConfig: IGameConfigProvider;
  private _regularSpinSoundModel: RegularSpinsSoundModel;
  private _winLinesConverter: IWinLinesConverter;
  private _winPositionsConverter: IWinPositionsConverter;
  private _startSlotActionProvider: IStartSlotActionProvider;
  private _stopSlotActionProvider: IStopSlotActionProvider;
  private _moduleParams: ISlotGameModule;
  private _moduleActionChecker: IModuleActionChecker;

  get currentResponse(): ModularSpinResponse {
    return this._gameStateMachine.curResponse as ModularSpinResponse;
  }

  get moduleReelState(): ReelState | null {
    return this.currentResponse.moduleReelStates.has(this._moduleParams.gameId)
      ? this.currentResponse.moduleReelStates.get(this._moduleParams.gameId)
      : null;
  }

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameConfig =
      container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._regularSpinSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._winLineComponent =
      container.forceResolve<WinLineActionComponent>(T_WinLineActionComponent);
    this._winLinesConverter = container.resolve(IWinLinesConverter);
    this._winPositionsConverter = container.resolve(IWinPositionsConverter);
    this._startSlotActionProvider = container.resolve(IStartSlotActionProvider);
    this._stopSlotActionProvider = container.resolve(IStopSlotActionProvider);
    this._moduleParams = container.resolve(ISlotGameModule).moduleParams;
    this._moduleActionChecker = container.resolve(IModuleActionChecker);
  }

  getStartSlotAction(): Action {
    if (!this._moduleActionChecker.isSpinAllowed) {
      return new EmptyAction();
    }

    const respinGroup =
      this.moduleReelState && this.moduleReelState.additionalData instanceof InternalRespinSpecGroup
        ? (this.moduleReelState.additionalData as InternalRespinSpecGroup)
        : null;
    return this._startSlotActionProvider.getStartSlotAction(
      respinGroup && respinGroup.respinCounter < respinGroup.groups.length
        ? SpinMode.ReSpin
        : SpinMode.Spin
    );
  }

  getStopSlotAction(): Action {
    if (!this._moduleActionChecker.isStopAllowed) {
      return new EmptyAction();
    }

    const respinGroup =
      this.moduleReelState && this.moduleReelState.additionalData instanceof InternalRespinSpecGroup
        ? (this.moduleReelState.additionalData as InternalRespinSpecGroup)
        : null;
    return this._stopSlotActionProvider.getStopSlotAction(
      respinGroup && respinGroup.respinStarted ? SpinMode.ReSpin : SpinMode.Spin
    );
  }

  getImmediatelyStopSlotAction(): Action {
    return new EmptyAction().withDuration(0.0);
  }

  getWinLinesAction(): Action {
    if (!this._moduleActionChecker.isWinLinesAllowed || !this.moduleReelState) {
      return new EmptyAction();
    }

    const winLines = this._winLinesConverter.getWinLines(this.moduleReelState);
    const winPosition = this._winPositionsConverter.getSimpleWinPositions(this.moduleReelState);
    this._winLineComponent.Update(
      this._regularSpinSoundModel,
      winLines,
      this.moduleReelState.viewReels,
      this._gameConfig.regularSpinConfig,
      winPosition
    );
    return this._winLineComponent.WinLineAction;
  }

  getShortWinLinesAction(): Action {
    if (!this._moduleActionChecker.isWinLinesAllowed || !this.moduleReelState) {
      return new EmptyAction();
    }

    const winLines = this._winLinesConverter.getWinLines(this.moduleReelState);
    const winPosition = this._winPositionsConverter.getSimpleWinPositions(this.moduleReelState);
    this._winLineComponent.Update(
      this._regularSpinSoundModel,
      winLines,
      this.moduleReelState.viewReels,
      this._gameConfig.regularSpinConfig,
      winPosition
    );
    return this._winLineComponent.ShortWinLineAction;
  }

  getSpecialWinLinesAction(): Action {
    if (!this._moduleActionChecker.isWinLinesAllowed || !this.moduleReelState) {
      return new EmptyAction();
    }

    const winLines = this._winLinesConverter.getWinLines(this.moduleReelState);
    const winPosition = this._winPositionsConverter.getSpecialWinPositions(this.moduleReelState);
    this._winLineComponent.Update(
      this._regularSpinSoundModel,
      winLines,
      this.moduleReelState.viewReels,
      this._gameConfig.regularSpinConfig,
      winPosition
    );
    return this._winLineComponent.SpecialLineAction;
  }

  getRespinWinLinesAction(): Action {
    if (!this._moduleActionChecker.isWinLinesAllowed) {
      return new EmptyAction();
    }

    const respinGroup = this.moduleReelState
      ? (this.moduleReelState.additionalData as InternalRespinSpecGroup)
      : null;

    if (respinGroup && respinGroup.respinCounter < respinGroup.groups.length - 1) {
      const winLines = respinGroup.currentRound.winLines;
      const winPosition = respinGroup.currentRound.winPositions;

      if ((winLines && winLines.length > 0) || (winPosition && winPosition.length > 0)) {
        this._winLineComponent.Update(
          this._regularSpinSoundModel,
          winLines,
          respinGroup.currentRound.newViewReels,
          this._gameConfig.regularSpinConfig,
          winPosition
        );
        return this._winLineComponent.ShortWinLineAction;
      }
    }

    return new EmptyAction().withDuration(0.0);
  }
}
