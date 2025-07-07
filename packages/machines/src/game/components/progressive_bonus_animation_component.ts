import {
  Action,
  Container,
  EmptyAction,
  ParallelSimpleAction,
  SequenceSimpleAction,
} from '@cgs/syd';
import { IBreakeable } from './node_tap_action/progressive_breaker/ibreakeable';
import { ISlotGameEngine } from '../../reels_engine/i_slot_game_engine';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { IProgressiveBonusActionsProvider } from './progressive_bonus/i_progressive_bonus_actions_provider';
import {
  T_IGameStateMachineProvider,
  T_IProgressiveBonusActionsProvider,
  T_ISlotGameEngineProvider,
} from '../../type_definitions';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';

export class ProgressiveBonusAnimationProvider implements IBreakeable {
  private _gameEngine: ISlotGameEngine;
  private _iconAnimationHelper: IconAnimationHelper;
  private _iconsSoundModel: IconsSoundModel;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _progressiveBonusActionsProvider: IProgressiveBonusActionsProvider;
  private _resetWhenCollectingComplete: boolean;
  private _maxCollectCount: number;
  private _marker: string;
  private _isCanceled: boolean;
  private _progressiveAction: Action;

  constructor(
    container: Container,
    marker: string,
    maxCollectCount: number,
    resetWhenCollectingComplete: boolean
  ) {
    this._gameEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._progressiveBonusActionsProvider =
      container.forceResolve<IProgressiveBonusActionsProvider>(T_IProgressiveBonusActionsProvider);
    this._resetWhenCollectingComplete = resetWhenCollectingComplete;
    this._maxCollectCount = maxCollectCount;
    this._marker = marker;

    this._gameStateMachine.stop.appendLazyAnimation(() => {
      this._progressiveAction = this.ProgressiveAction(this._gameStateMachine.curResponse, marker);
      return this._progressiveAction;
    });

    this._gameStateMachine.init.entered.listen((e) => {
      this.RecoverProgressiveBonus(this._gameStateMachine.curResponse, marker);
    });

    this._gameStateMachine.stop.entering.listen((e) => {
      this._isCanceled = false;
    });
  }

  get gameEngine(): ISlotGameEngine {
    return this._gameEngine;
  }

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  get progressiveBonusActionsProvider(): IProgressiveBonusActionsProvider {
    return this._progressiveBonusActionsProvider;
  }

  get resetWhenCollectingComplete(): boolean {
    return this._resetWhenCollectingComplete;
  }

  get maxCollectCount(): number {
    return this._maxCollectCount;
  }

  get marker(): string {
    return this._marker;
  }

  get isCanceled(): boolean {
    return this._isCanceled;
  }

  set isCanceled(value: boolean) {
    this._isCanceled = value;
  }

  get progressiveAction(): Action {
    return this._progressiveAction;
  }

  set progressiveAction(value: Action) {
    this._progressiveAction = value;
  }

  doBreak(): void {
    if (!this._isCanceled && this._progressiveAction && !this._progressiveAction.isDone) {
      this._progressiveAction.end();
      this._progressiveBonusActionsProvider.StopAllAnimations(this._marker);
      this._progressiveBonusActionsProvider.hideMovingScene();
      this._isCanceled = true;
    }
  }

  RecoverProgressiveBonus(response: ISpinResponse, marker: string): void {
    const symbols = response.specialSymbolGroups;
    const markerSymbols =
      symbols && symbols.length > 0 ? symbols.filter((s) => s.type === marker) : [];
    const collectCount =
      markerSymbols.length > 0
        ? markerSymbols
            .map((s) => s.collectCount!)
            .reduce((max, current) => Math.max(max, current), -Infinity)
        : 0;
    const currentWin =
      markerSymbols.length > 0
        ? markerSymbols
            .map((s) => s.totalJackPotWin)
            .reduce((max, current) => Math.max(max, current), -Infinity)
        : 0;

    if (collectCount > 0) {
      this._progressiveBonusActionsProvider.ProgressiveRecovery(
        collectCount - 1,
        currentWin,
        this._resetWhenCollectingComplete
      );
    }
  }

  ProgressiveAction(response: ISpinResponse, marker: string): Action {
    const symbols = this.progressiveBonusSymbols(response, marker);
    const symbolActions: Action[] = [];

    if (symbols && symbols.some((s) => !!s)) {
      for (const symbol of symbols) {
        const actions: Action[] = [];
        for (const position of symbol.positions!.filter(
          (p) => typeof p === 'number' && typeof symbol.symbolId === 'number'
        )) {
          const positionWin =
            symbol.positionsWin && symbol.positionsWin.length === symbol.positions!.length
              ? symbol.positionsWin[symbol.positions!.indexOf(position)]
              : 0.0;

          actions.push(
            new ParallelSimpleAction([
              this._progressiveBonusActionsProvider.IconAnimationAction(position),
              new SequenceSimpleAction([
                this._progressiveBonusActionsProvider.MovingSceneAction(position),
                this._progressiveBonusActionsProvider.ProgressiveSceneAction(
                  symbol.symbolId!,
                  positionWin
                ),
              ]),
            ])
          );
        }

        if (this._resetWhenCollectingComplete && symbol.collectCount === this._maxCollectCount) {
          actions.push(this._progressiveBonusActionsProvider.ResetAction());
        }

        symbolActions.push(new SequenceSimpleAction(actions));
      }

      return new SequenceSimpleAction(symbolActions);
    }

    return new EmptyAction().withDuration(0.0);
  }

  progressiveBonusSymbols(response: ISpinResponse, marker: string): SpecialSymbolGroup[] {
    const symbols = response.specialSymbolGroups;
    return symbols && symbols.length > 0 ? symbols.filter((p) => p.type === marker) : [];
  }
}
