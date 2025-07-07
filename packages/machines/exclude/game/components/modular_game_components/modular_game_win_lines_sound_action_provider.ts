class ModularGameWinLinesSoundActionProvider
  extends GameComponentProvider
  implements ICustomWinLinesSoundActionProvider
{
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _modularSlotGame: BaseModularSlotGame;
  private _reelsEngine: ReelsEngine;
  private _drawableIndex: ComponentIndex;
  private _iconSoundModel: IconsSoundModel;
  private _reelsSoundModel: ReelsSoundModel;
  private _modularSlotSession: ModularSlotSession;

  private _startWinLinesSoundAction: IntervalAction;
  private _stopWinLinesSoundAction: IntervalAction;

  get startWinLinesSoundAction(): IntervalAction {
    return this._startWinLinesSoundAction;
  }

  get stopWinLinesSoundAction(): IntervalAction {
    return this._stopWinLinesSoundAction;
  }

  private _container: Container;

  constructor(container: Container) {
    super();
    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._modularSlotGame = container.forceResolve<ISlotGame>(T_ISlotGame) as BaseModularSlotGame;
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._drawableIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.DrawableIndex
    );
    this._iconSoundModel = container.resolve(IconsSoundModelComponent).iconsSoundModel;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._modularSlotSession = container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider)
      .slotSession as ModularSlotSession;
  }

  updateActions(winLines: Line[] | null = null): void {
    const modularSpinResponse = this._gameStateMachine.curResponse as ModularSpinResponse;
    if (!modularSpinResponse) {
      this._startWinLinesSoundAction = new EmptyAction();
      this._stopWinLinesSoundAction = new EmptyAction();
      return;
    }

    const mainGameLines = winLines ?? modularSpinResponse.winLines;
    const allWinLineIconIds: number[] = [];
    let isWinPositions = false;
    for (const [moduleId, moduleState] of Object.entries(modularSpinResponse.moduleReelStates)) {
      if (moduleState.winPositions && moduleState.winPositions.length > 0) {
        isWinPositions = true;
      }
    }
    if (!isWinPositions) {
      if (mainGameLines) {
        for (const line of mainGameLines) {
          for (const position of line.iconsIndexes) {
            allWinLineIconIds.push(
              this._reelsEngine.iconAnimationHelper
                .getEntities(position)
                .first.get(this._drawableIndex)
            );
          }
        }
      }
    }

    if (this.tryCreateSoundActions(allWinLineIconIds)) {
      return;
    }

    for (const [moduleId, moduleState] of Object.entries(modularSpinResponse.moduleReelStates)) {
      if (moduleState.winLines) {
        const module = this._modularSlotGame.modules.find((m) => m.moduleParams.gameId == moduleId);
        if (module) {
          const winPos: Line[] = [];
          if (moduleState.winPositions) {
            for (const e of moduleState.winPositions) {
              const line = new Line();
              line.iconsIndexes = e.positions;
              line.symbolId = e.symbol;
              winPos.push(line);
            }
          }
          const moduleReelsEngine = module.getComponent(ISlotGameEngineProvider)
            .gameEngine as ReelsEngine;
          const moduleDrawableIndex = moduleReelsEngine.entityEngine.getComponentIndex(
            ComponentNames.DrawableIndex
          );

          if (!isWinPositions) {
            for (const line of moduleState.winLines) {
              for (const position of line.iconsIndexes) {
                allWinLineIconIds.push(
                  moduleReelsEngine.iconAnimationHelper
                    .getEntities(position)
                    .first.get(moduleDrawableIndex)
                );
              }
            }
          } else {
            for (const line of winPos) {
              for (const position of line.iconsIndexes) {
                allWinLineIconIds.push(
                  moduleReelsEngine.iconAnimationHelper
                    .getEntities(position)
                    .first.get(moduleDrawableIndex)
                );
              }
            }
          }
        }
      }
    }

    if (this.tryCreateSoundActions(allWinLineIconIds)) {
      return;
    }

    if (winLines && winLines.length > 0) {
      this._startWinLinesSoundAction = new FunctionAction(() => {
        this._reelsSoundModel.winSound.stop();
        this._reelsSoundModel.winSound.play();
      });
    } else {
      this._startWinLinesSoundAction = new EmptyAction();
    }

    this._stopWinLinesSoundAction = new EmptyAction();
  }

  private tryCreateSoundActions(allWinLineIconIds: number[]): boolean {
    const fastSpinsController = this._container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    if (
      fastSpinsController.isFastSpinsActive &&
      (gameStateMachine.isAutoSpins || gameStateMachine.curResponse.isFreeSpins)
    ) {
      return false;
    }
    const wildSymbolIds = this.getWildSymbolIds();
    allWinLineIconIds = Array.from(new Set(allWinLineIconIds));
    allWinLineIconIds.sort((i1, i2) =>
      wildSymbolIds.includes(i1) && !wildSymbolIds.includes(i2) ? 1 : -1
    );
    for (const iconId of allWinLineIconIds) {
      if (this._iconSoundModel.hasSound(iconId)) {
        const sound = this._iconSoundModel.getIconSound(iconId);
        this._startWinLinesSoundAction = new FunctionAction(() => {
          sound.stop();
          sound.play();
        });
        this._stopWinLinesSoundAction = new EmptyAction();

        return true;
      }
    }

    return false;
  }

  private getWildSymbolIds(): number[] {
    const wildSymbolIds = this._modularSlotSession.machineInfo.symbols
      .filter((s) => s.type == 'wild' || s.type == 'alternativeWild')
      .map((s) => s.id);

    for (const [moduleId, moduleInfo] of Object.entries(
      this._modularSlotSession.modularMachineInfo.modulesInfo
    )) {
      wildSymbolIds.push(
        ...moduleInfo.symbols
          .filter((s) => s.type == 'wild' || s.type == 'alternativeWild')
          .map((s) => s.id)
      );
    }

    return wildSymbolIds;
  }
}
