import { Container } from 'inversify';
import { AnimationBasedGameEngine } from 'machines';
import {
  GameStateMachine,
  ISpinResponse,
  InternalCollapsingSpecGroup,
  SpecialSymbolGroup,
} from 'syd';
import {
  ReelsSoundModel,
  IconsSoundModel,
  DynamicDrawOrdersProvider,
  SoundInstance,
} from 'machines/src/reels_engine_library';
import {
  IGameStateMachineProvider,
  RegularSpinsSoundModelComponent,
  IconsSoundModelComponent,
  ISlotGameEngineProvider,
  IAnimationBasedGameEngineProvider,
} from 'common';

class AnimationGameSuspendingWildProvider {
  private static readonly animationSuspendingDrawOrder: number = 100;
  private _gameEngine: AnimationBasedGameEngine;
  private _suspendingWildIconId: number;
  private _suspendingWildAnimName: string;
  private _wildSoundInstance: string;
  private _reelsSoundModel: ReelsSoundModel;
  private _iconSoundModel: IconsSoundModel;
  private _dynamicDrawOrdersProvider: DynamicDrawOrdersProvider;
  private _wildAppearSound: SoundInstance | null;

  constructor(
    container: Container,
    marker: string,
    suspendingWildIconId: number,
    suspendingWildAnimName: string,
    wildSoundInstance: string,
    wildAppearSound: string | null = null
  ) {
    console.log('load ' + this.constructor.name);

    const gameStateMachine: GameStateMachine =
      container.get<IGameStateMachineProvider>(IGameStateMachineProvider).gameStateMachine;
    this._reelsSoundModel = container.get<RegularSpinsSoundModelComponent>(
      RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._iconSoundModel =
      container.get<IconsSoundModelComponent>(IconsSoundModelComponent).iconsSoundModel;
    this._gameEngine = container.get<IAnimationBasedGameEngineProvider>(ISlotGameEngineProvider)
      .gameEngine as AnimationBasedGameEngine;
    this._suspendingWildIconId = suspendingWildIconId;
    this._suspendingWildAnimName = suspendingWildAnimName;
    this._wildSoundInstance = wildSoundInstance;
    this._dynamicDrawOrdersProvider =
      container.get<DynamicDrawOrdersProvider>(DynamicDrawOrdersProvider);

    if (wildAppearSound && wildAppearSound.length > 0) {
      this._wildAppearSound = this._reelsSoundModel.getSoundByName(wildAppearSound);
    }

    gameStateMachine.stop.addLazyAnimationToBegin(() =>
      this.buildOnStopSuspendingAction(gameStateMachine.curResponse, marker)
    );

    if (gameStateMachine instanceof CollapseGameStateMachine) {
      gameStateMachine.endCollapseState.appendLazyAnimation(() =>
        this.buildOnEndCollapseSuspendingAction(gameStateMachine.curResponse, marker)
      );
    }
  }

  private buildOnStopSuspendingAction(response: ISpinResponse, marker: string): Action {
    const symbols = response.specialSymbolGroups;
    const symbol = symbols ? symbols.find((p) => p.type === marker) : null;

    return symbol
      ? this.buildSuspendingAction(symbol)
      : (new EmptyAction() as Action).withDuration(0.0);
  }

  private buildOnEndCollapseSuspendingAction(response: ISpinResponse, marker: string): Action {
    const collapsingGroup = response.additionalData as InternalCollapsingSpecGroup;
    if (collapsingGroup && collapsingGroup.collapsingCounter > 0) {
      const symbols =
        collapsingGroup.groups[collapsingGroup.collapsingCounter - 1].specialSymbolGroups;
      const symbol = symbols ? symbols.find((p) => p.type === marker) : null;

      if (symbol) {
        return this.buildSuspendingAction(symbol);
      }
    }
    return (new EmptyAction() as Action).withDuration(0.0);
  }

  private buildSuspendingAction(symbol: SpecialSymbolGroup): Action {
    if (symbol && symbol.positions) {
      const actions: IntervalAction[] = [];

      const suspendPosition = symbol.previousPositions[0];
      const suspendIcon = this._gameEngine.getIconByPosition(suspendPosition);
      const suspendDuration = (
        suspendIcon.stateMachine.findById(this._suspendingWildAnimName)
          .enterAction as IntervalAction
      ).duration;
      const suspendAction = new ParallelAction([
        new FunctionAction(() =>
          suspendIcon.stateMachine.switchToState(this._suspendingWildAnimName)
        ),
        new FunctionAction(() =>
          this._gameEngine.setIconDrawOrder(
            suspendPosition,
            suspendIcon.z +
              AnimationGameSuspendingWildProvider.animationSuspendingDrawOrder +
              suspendPosition
          )
        ),
        new StopSoundAction(this._reelsSoundModel.getSoundByName(this._wildSoundInstance)),
        new PlaySoundAction(this._reelsSoundModel.getSoundByName(this._wildSoundInstance)),
        (new EmptyAction() as Action).withDuration(suspendDuration * 0.5),
      ]);

      for (const position of symbol.positions) {
        const symbolActions: IntervalAction[] = [];

        const iconUnderWild = this._gameEngine.getIconByPosition(position);
        this._gameEngine.setItemIcon(position, this._suspendingWildIconId, 'hide');
        const iconWild = this._gameEngine.getIconByPosition(position);
        const duration = (
          iconWild.stateMachine.findById(this._suspendingWildAnimName).enterAction as IntervalAction
        ).duration;

        symbolActions.push(
          new ParallelAction([
            new FunctionAction(() => {
              iconUnderWild.stateMachine.switchToState('to_wild');
              this._gameEngine.setIconDrawOrder(position, iconWild.z + position);
              this._gameEngine.setIconDrawOrder(position, iconUnderWild.z + position);
              iconWild.stateMachine.switchToState(this._suspendingWildAnimName);
            }),
            (new EmptyAction() as Action).withDuration(duration),
          ])
        );

        actions.push(new SequenceAction(symbolActions));
      }

      const stopAnimAction = new SequenceAction([
        new FunctionAction(() => this._gameEngine.setIconDrawOrder(suspendPosition, suspendIcon.z)),
      ]);

      return new SequenceAction([
        suspendAction,
        new FunctionAction(() => {
          if (this._wildAppearSound && symbol.positions.length > 0) {
            this._wildAppearSound.stop();
            this._wildAppearSound.play();
          }
        }),
        new ParallelAction(actions),
        stopAnimAction,
      ]);
    }
    return (new EmptyAction() as Action).withDuration(0.0);
  }
}
