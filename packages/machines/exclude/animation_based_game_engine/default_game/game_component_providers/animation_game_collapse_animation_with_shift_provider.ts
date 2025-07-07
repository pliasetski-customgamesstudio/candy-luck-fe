import { EventDispatcher } from 'event-dispatch';
import { Container } from 'inversify';
import { CollapseAnimationBasedGameEngine, CollapseGameStateMachine, IAnimationBasedGameConfig, CollapseGameConfig, ReelsSoundModel, IconsSoundModel, InternalCollapsingSpecGroup, Line } from 'machines';
import { StringUtils } from 'shared';

class AnimationGameCollapseAnimationWithShiftProvider {
  private _container: Container;
  private _gameEngine: CollapseAnimationBasedGameEngine;
  private _gameStateMachine: CollapseGameStateMachine;
  private _gameConfig: IAnimationBasedGameConfig;
  private _collapsingConfig: CollapseGameConfig;
  private _reelSoundModel: ReelsSoundModel;
  private _iconsSoundModel: IconsSoundModel;

  private _shiftStateFormat: string;
  private _fallStateFormat: string;
  private _hideIconAnimName: string;
  private _hideIconSound: string;
  private _shiftSound: SoundInstance;
  private _fallSound: SoundInstance;
  private _shiftDirection: boolean;
  private _useIconCollapseDuration: boolean;
  private _crashSymbolAnimDuration: number;

  private _iconShiftFinished: EventDispatcher;
  private _isIconShiftStarted: boolean;

  constructor(
    container: Container,
    shiftStateFormat: string,
    fallStateFormat: string,
    hideIconAnimName: string,
    hideIconSound: string,
    fallIconsSound: string,
    shiftIconsSound: string,
    shiftDirection: boolean = true,
    useIconCollapseDuration: boolean = true,
    crashSymbolAnimDuration: number = 0.0
  ) {
    this._container = container;
    this._shiftStateFormat = shiftStateFormat;
    this._fallStateFormat = fallStateFormat;
    this._hideIconAnimName = hideIconAnimName;
    this._hideIconSound = hideIconSound;
    this._shiftDirection = shiftDirection;
    this._useIconCollapseDuration = useIconCollapseDuration;
    this._crashSymbolAnimDuration = crashSymbolAnimDuration;

    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine as CollapseGameStateMachine;
    this._reelSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(T_RegularSpinsSoundModelComponent).regularSpinSoundModel;
    this._iconsSoundModel = this._container.resolve(IconsSoundModelComponent).iconsSoundModel;
    this._collapsingConfig = this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    this._gameConfig = this._container.resolve(IAnimationBasedGameConfigProvider).gameConfig;
    this._gameEngine = this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine as CollapseAnimationBasedGameEngine;

    if (shiftIconsSound && shiftIconsSound.length > 0) {
      this._shiftSound = this._reelSoundModel.getSoundByName(shiftIconsSound);
    }
    if (fallIconsSound && fallIconsSound.length > 0) {
      this._fallSound = this._reelSoundModel.getSoundByName(fallIconsSound);
    }

    this._gameStateMachine.beginCollapseState.appendLazyAnimation(() => new FunctionAction(() => {
      this._isIconShiftStarted = false;
      this._gameEngine.stopAllAnimations();
    }));
    this._gameStateMachine.collapseState.setLazyAnimation(() => this.buildTotalCollapseAction());
    this._gameStateMachine.endCollapseState.setLazyAnimation(() => this.increaseCounter());
  }

  private buildTotalCollapseAction(): Action {
    return new SequenceSimpleAction([
      new ParallelSimpleAction([
        this.buildCollapseAction(),
        new SequenceSimpleAction([
          new EmptyAction().withDuration(this._useIconCollapseDuration
            ? this.getCollapseDuration()
            : this._collapsingConfig.regularSpinCollapsingConfig.collapsingParameters.iconOutgoingStartDelay),
          new ParallelSimpleAction([
            this._gameEngine.hideIconsAnimationAction,
            new SequenceSimpleAction([
              new EmptyAction().withDuration(this._collapsingConfig.regularSpinCollapsingConfig.collapsingParameters.iconShiftStartDelay),
              this.buildCurrentRoundIconsAction()
            ])
          ])
        ])
      ]),
      new ParallelSimpleAction([
        new WaitForAction(this._gameEngine.iconsHideFinished.eventStream).subscribe(),
        new WaitForAction(this._iconShiftFinished.eventStream).subscribe()
      ]),
      new SequenceSimpleAction([this.buildShowNewIconsAction()])
    ]);
  }

  private getCollapseDuration(): number {
    const collapsePositions = this.getCollapsePositions();
    let duration = collapsePositions.map((p) => this.getIconAnimDuration(p, "anim")).reduce((a, b) => Math.max(a, b)) + collapsePositions.map((p) => this.getIconAnimDuration(p, "collaps")).reduce((a, b) => Math.max(a, b));

    const crashSymbols = this.getCrashSymbols();
    if (crashSymbols && crashSymbols.length > 0) {
      const crashPositions: number[] = [];
      crashSymbols.forEach((s) => crashPositions.push(...s.previousPositions));
      duration += this._crashSymbolAnimDuration;
    }

    return duration > 0.2 ? duration - 0.2 : 0.0;
  }

  private buildCollapseAction(): Action {
    const collapsePositions = this.getCollapsePositions();
    const changePlaceholderActions = collapsePositions.map((p) => this.buildChangePlaceholderAction(p));
    let iconAnimActions: Action[] = [];
    let iconHideActions: Action[] = [];
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;

    const crashSymbols = this.getCrashSymbols();
    if (crashSymbols && crashSymbols.length > 0) {
      const crashPositions: number[] = [];
      crashSymbols.forEach((s) => crashPositions.push(...s.previousPositions));
      crashPositions.forEach((p) => collapsePositions.splice(collapsePositions.indexOf(p), 1));
      iconAnimActions.push(new SequenceSimpleAction([
        new ParallelSimpleAction(crashPositions.map((p) => this.buildCrashIconAnimationAction(p))),
        new FunctionAction(() => collapsePositions.forEach((p) => this._gameEngine.removeCollapseItemIcon(p))))
      ]));
    } else {
      iconAnimActions = collapsePositions.map((p) => this.buildIconAnimationAction(p));
      iconHideActions = collapsePositions.map((p) => this.buildIconHideAction(p));
    }
    if (group && group.currentRound.type == "shiftCollapsingGroup") {
      iconAnimActions.push(this.buildWinLinesSoundAction());
    }
    iconHideActions.push(new FunctionAction(() => {
      if (this._hideIconSound && this._hideIconSound.length > 0) {
        if (group && group.currentRound.type == "shiftCollapsingGroup") {
          const hideSound = this._reelSoundModel.getSoundByName(this._hideIconSound);
          hideSound.stop();
          hideSound.play();
        }
      }
    }));

    return new SequenceSimpleAction([
      new FunctionAction(() => {
        this._gameEngine.reset();
        this._gameEngine.showCollapseIcons();
      }),
      new ParallelSimpleAction(changePlaceholderActions),
      new ParallelSimpleAction(iconAnimActions),
      new ParallelSimpleAction(iconHideActions)
    ]);
  }

  private buildWinLinesSoundAction(): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    if (group) {
      const winLines = this._gameStateMachine.curResponse.winLines.length > 0
        ? this._gameStateMachine.curResponse.winLines
        : group.currentRound.winLines;

      if (winLines && winLines.length > 0) {
        return new AllWinLinesSoundAction(this._container, winLines);
      }
    }

    return new EmptyAction().withDuration(0.0);
  }

  private buildChangePlaceholderAction(position: number): Action {
    return new FunctionAction(() => {
      this._gameEngine.removeItemIcon(position);
      this._gameEngine.setCollapseItemIcon(position, this._gameEngine.symbolPositionCache[position]);
    });
  }

  private buildIconAnimationAction(position: number): Action {
    return new LazyAction(() => new SequenceSimpleAction([
      new FunctionAction(() => {
        const icon = this._gameEngine.getCollapseIconByPosition(position);
        if (icon && icon.stateMachine) {
          icon.stateMachine.switchToState("anim");
        }
      }),
      new EmptyAction().withDuration(this.getCollapseIconAnimDuration(position, "anim")),
      new FunctionAction(() => {
        const icon = this._gameEngine.getCollapseIconByPosition(position);
        if (icon && icon.stateMachine && !this._isIconShiftStarted) {
          icon.stateMachine.switchToState("final");
        }
      })
    ]));
  }

  private buildIconHideAction(position: number): Action {
    return new LazyAction(() => new SequenceSimpleAction([
      new FunctionAction(() => {
        if (this._hideIconAnimName && this._hideIconAnimName.length > 0) {
          const icon = this._gameEngine.getCollapseIconByPosition(position);
          if (icon && icon.stateMachine) {
            icon.stateMachine.switchToState(this._hideIconAnimName);
          }
        }
      })
    ]));
  }

  private buildCrashIconAnimationAction(position: number): Action {
    return new LazyAction(() => new SequenceSimpleAction([
      new FunctionAction(() => {
        const icon = this._gameEngine.getCollapseIconByPosition(position);
        if (icon && icon.stateMachine) {
          icon.stateMachine.switchToState("anim");
        }
      }),
      new EmptyAction().withDuration(this.getCollapseIconAnimDuration(position, "anim")),
      new FunctionAction(() => {
        const icon = this._gameEngine.getCollapseIconByPosition(position);
        if (icon && icon.stateMachine) {
          icon.stateMachine.switchToState("crash");
        }
      }),
      new EmptyAction().withDuration(this.getCollapseIconAnimDuration(position, "crash") - 0.7)
    ]));
  }

  private getIconAnimDuration(position: number, animName: string): number {
    const icon = this._gameEngine.getIconByPosition(position);
    const iconAnimState = icon.stateMachine.findById(animName);
    return iconAnimState ? (iconAnimState.enterAction as IntervalAction).duration : 0.0;
  }

  private getCollapseIconAnimDuration(position: number, animName: string): number {
    const icon = this._gameEngine.getCollapseIconByPosition(position);
    const iconAnimState = icon.stateMachine.findById(animName);
    return iconAnimState ? (iconAnimState.enterAction as IntervalAction).duration : 0.0;
  }

  private buildShowNewIconsAction(): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    if (group) {
      const actions: Action[] = [];

      if (!group.currentRound.winLines) {
        this._gameStateMachine.curResponse.winLines = [];
      } else {
        this._gameStateMachine.curResponse.winLines = group.currentRound.winLines;
      }

      actions.push(this.showNewIconsAction(group.currentRound.positions, group.currentRound.newReels));

      return new SequenceSimpleAction(actions);
    }

    return new EmptyAction().withDuration(0.0);
  }

  private increaseCounter(): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    return new FunctionAction(() => group.collapsingCounter++);
  }

  private showNewIconsAction(positions: number[], newIcons: number[]): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    const actions: IntervalAction[] = [];
    actions.push(new FunctionAction(() => {
      this._gameEngine.reset();
      for (const position of positions) {
        this._gameEngine.setCollapseItemIcon(position, newIcons[positions.indexOf(position)]);
      }
    }));
    if (group.currentRound.type != "shiftCollapsingGroup") {
      actions.push(this._gameEngine.showIconsAnimationAction);
    }
    actions.push(new FunctionAction(() => {
      for (const position of positions) {
        this._gameEngine.removeCollapseItemIcon(position);
        this._gameEngine.setItemIcon(position, newIcons[positions.indexOf(position)]);
      }
    }));
    return new SequenceSimpleAction(actions);
  }

  private buildCurrentRoundIconsAction(): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    if (group) {
      return group.currentRound.type == "shiftCollapsingGroup" ? this.buildShiftCurrentIconsAction() : this.buildFallCurrentIconsAction();
    }
    return new EmptyAction();
  }

  private buildShiftCurrentIconsAction(): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    if (group) {
      const actions: Action[] = [];
      const shiftedPositions: number[] = [];
      const newPositions: number[] = [];
      const shiftedIcons: number[] = [];

      let shiftDuration = 0.0;
      let additionalDelay = 0.0;
      let shiftSoundAdded = false;

      actions.push(new FunctionAction(() => this._isIconShiftStarted = true));

      const collapsePositions = this.getCollapsePositions();

      for (let position = 0; position < this._gameConfig.iconsCount; position++) {
        const directionPosition = this._shiftDirection ? this._gameConfig.iconsCount - 1 - position : position;
        if (!collapsePositions.includes(directionPosition)) {
          const icon = this._gameEngine.getIconByPosition(directionPosition);
          if (icon && icon.stateMachine) {
            const shiftValue = this.getShiftValue(collapsePositions, directionPosition);
            if (shiftValue > 0) {
              shiftedPositions.push(directionPosition);
              shiftedIcons.push(this._gameEngine.getIconIdByPosition(directionPosition));
              newPositions.push(this.calculateNewShiftedPosition(directionPosition, shiftValue));

              const currentDuration = (icon.stateMachine.findById(StringUtils.format(this._shiftStateFormat, [shiftValue.toString()])).enterAction as IntervalAction).duration;
              if (currentDuration > shiftDuration) {
                shiftDuration = currentDuration;
              }

              if (this._shiftSound && !shiftSoundAdded) {
                actions.push(new SequenceSimpleAction([
                  new StopSoundAction(this._shiftSound),
                  new PlaySoundAction(this._shiftSound)
                ]));
                shiftSoundAdded = true;
              }

              actions.push(new FunctionAction(() => icon.stateMachine.switchToState(StringUtils.format(this._shiftStateFormat, [shiftValue.toString()]))));
              if (directionPosition != this._gameConfig.iconsCount - 1) {
                const delay = this._collapsingConfig.regularSpinCollapsingConfig.collapsingParameters.iconFallingStartDelay;
                actions.push(new EmptyAction().withDuration(delay));
                additionalDelay += delay;
              }
            }
          }
        }
      }

      actions.push(new FunctionAction(() => this._iconShiftFinished.dispatchEvent()));
      actions.push(new EmptyAction().withDuration(shiftDuration));

      actions.push(new FunctionAction(() => {
        for (const shiftedPosition of shiftedPositions) {
          this._gameEngine.removeItemIcon(shiftedPosition);
        }

        for (const newPosition of newPositions) {
          this._gameEngine.setItemIcon(newPosition, shiftedIcons[newPositions.indexOf(newPosition)]);
        }
      }));

      return new ParallelSimpleAction([
        new EmptyAction().withDuration(shiftDuration + additionalDelay),
        new SequenceSimpleAction(actions)
      ]);
    }

    return new EmptyAction().withDuration(0.0);
  }

  private buildFallCurrentIconsAction(): Action {
    const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    if (group) {
      const actions: Action[] = [];
      const shiftedPositions: number[] = [];
      const newPositions: number[] = [];
      const shiftedIcons: number[] = [];

      let shiftDuration = 0.0;
      let additionalDelay = 0.0;
      let shiftSoundAdded = false;

      actions.push(new FunctionAction(() => this._isIconShiftStarted = true));

      const collapsePositions = this.getCollapsePositions();

      for (let position = 0; position < this._gameConfig.iconsCount; position++) {
        const directionPosition = this._shiftDirection ? this._gameConfig.iconsCount - 1 - position : position;
        if (!collapsePositions.includes(directionPosition)) {
          const icon = this._gameEngine.getIconByPosition(directionPosition);
          if (icon && icon.stateMachine) {
            const shiftValue = this.getFallValue(collapsePositions, directionPosition);
            if (shiftValue > 0) {
              shiftedPositions.push(directionPosition);
              shiftedIcons.push(this._gameEngine.getIconIdByPosition(directionPosition));
              newPositions.push(this.calculateNewPosition(directionPosition, shiftValue));

              const currentDuration = (icon.stateMachine.findById(StringUtils.format(this._fallStateFormat, [shiftValue.toString()])).enterAction as IntervalAction).duration;
              if (currentDuration > shiftDuration) {
                shiftDuration = currentDuration;
              }

              if (this._fallSound && !shiftSoundAdded) {
                actions.push(new SequenceSimpleAction([
                  new StopSoundAction(this._fallSound),
                  new PlaySoundAction(this._fallSound)
                ]));
                shiftSoundAdded = true;
              }

              actions.push(new FunctionAction(() => icon.stateMachine.switchToState(StringUtils.format(this._fallStateFormat, [shiftValue.toString()]))));
              if (directionPosition != this._gameConfig.iconsCount - 1) {
                const delay = this._collapsingConfig.regularSpinCollapsingConfig.collapsingParameters.iconFallingStartDelay;
                actions.push(new EmptyAction().withDuration(delay));
                additionalDelay += delay;
              }
            }
          }
        }
      }

      actions.push(new FunctionAction(() => this._iconShiftFinished.dispatchEvent()));
      actions.push(new EmptyAction().withDuration(shiftDuration));

      actions.push(new FunctionAction(() => {
        for (const shiftedPosition of shiftedPositions) {
          this._gameEngine.removeItemIcon(shiftedPosition);
        }

        for (const newPosition of newPositions) {
          this._gameEngine.setItemIcon(newPosition, shiftedIcons[newPositions.indexOf(newPosition)]);
        }
      }));

      return new ParallelSimpleAction([
        new EmptyAction().withDuration(shiftDuration + additionalDelay),
        new SequenceSimpleAction(actions)
      ]);
    }

    return new EmptyAction().withDuration(0.0);
  }

  private getCollapsePositions(): number[] {
    const crashSymbols = this.getCrashSymbols();
    let result: number[] = [];
    if (crashSymbols && crashSymbols.length > 0) {
      crashSymbols.forEach((s) => result.push(...s.positions));
    } else {
      const group = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
      if (group) {
        result = this._gameStateMachine.curResponse.winLines.length > 0
          ? this.getWinLinePositions(this._gameStateMachine.curResponse.winLines)
          : this.getWinLinePositions(group.currentRound.winLines);
      }
    }

    return result;
  }

  private getCrashSymbols(): SpecialSymbolGroup[] {
    const collapsingGroup = this._gameStateMachine.curResponse.additionalData as InternalCollapsingSpecGroup;
    let result: SpecialSymbolGroup[] = null;
    if (collapsingGroup) {
      if (collapsingGroup.collapsingCounter == 0 && this._gameStateMachine.curResponse.specialSymbolGroups) {
        result = this._gameStateMachine.curResponse.specialSymbolGroups.filter((symbol) => symbol.type == "CrashRow");
      } else if (collapsingGroup.collapsingCounter > 0 && collapsingGroup.groups[collapsingGroup.collapsingCounter - 1].specialSymbolGroups) {
        result = collapsingGroup.groups[collapsingGroup.collapsingCounter - 1].specialSymbolGroups.filter((symbol) => symbol.type == "CrashRow");
      }
    }

    return result;
  }

  private getShiftValue(collapsePositions: number[], position: number): number {
    const lineNumber = Math.floor(position / this._gameConfig.groupsCount);
    const reelNumber = position % this._gameConfig.groupsCount;

    return this._shiftDirection
      ? collapsePositions.filter((p) => Math.floor(p / this._gameConfig.groupsCount) == lineNumber && p % this._gameConfig.groupsCount > reelNumber).length
      : collapsePositions.filter((p) => Math.floor(p / this._gameConfig.groupsCount) == lineNumber && p % this._gameConfig.groupsCount < reelNumber).length;
  }

  private getFallValue(collapsePositions: number[], position: number): number {
    const lineNumber = Math.floor(position / this._gameConfig.groupsCount);
    const reelNumber = position % this._gameConfig.groupsCount;

    return this._shiftDirection
      ? collapsePositions.filter((p) => p % this._gameConfig.groupsCount == reelNumber && Math.floor(p / this._gameConfig.groupsCount) > lineNumber).length
      : collapsePositions.filter((p) => p % this._gameConfig.groupsCount == reelNumber && Math.floor(p / this._gameConfig.groupsCount) < lineNumber).length;
  }

  private calculateNewShiftedPosition(position: number, shiftValue: number): number {
    return this._shiftDirection
      ? position + shiftValue
      : position - shiftValue;
  }

  private calculateNewPosition(position: number, shiftValue: number): number {
    return this._shiftDirection
      ? position + shiftValue * this._gameConfig.groupsCount
      : position - shiftValue * this._gameConfig.groupsCount;
  }

  private getWinLinePositions(winLines: Line[]): number[] {
    const positions = new Set<number>();
    winLines.forEach((l) => l.iconsIndexes.forEach((i) => positions.add(i)));
    return Array.from(positions);
  }
}
