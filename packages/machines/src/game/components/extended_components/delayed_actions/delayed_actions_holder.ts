import { GameTimer } from '@cgs/common';
import { Queue, LazyAction } from '@cgs/shared';
import { Action, ActionActivator, SceneObject, Container } from '@cgs/syd';
import { GameComponentProvider } from '../../game_component_provider';
import { ConditionAction } from '../../win_lines/complex_win_line_actions/condition_action';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import { T_ISlotGame } from '../../../../type_definitions';

export interface IDelayedActionHolder {
  appendActionToLazyExecute(action: Action, executeImmediately?: boolean): void;
  waitTillCollectionFinished(): Action;
  isCollectionFinished: boolean;
  clearNotStartedActions(): void;
  executeDelayedActions(): void;
}

export class DelayedActionsHolder extends GameComponentProvider implements IDelayedActionHolder {
  private _actions: Queue<ActionActivator>;
  get actions(): Queue<ActionActivator> {
    return this._actions;
  }

  private _gameTimer: GameTimer;
  private _game: SceneObject;

  private _collectionWorking: boolean = false;
  get collectionWorking(): boolean {
    return this._collectionWorking;
  }
  set collectionWorking(value: boolean) {
    this._collectionWorking = value;
  }

  private _sequenceExecution: boolean = false;
  get sequenceExecution(): boolean {
    return this._sequenceExecution;
  }

  private _activeActionActivators: ActionActivator[];
  get activeActionActivators(): ActionActivator[] {
    return this._activeActionActivators;
  }

  constructor(container: Container, sequenceExecution: boolean = false, useTimer: boolean = true) {
    super();
    this._sequenceExecution = sequenceExecution;
    this._game = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._actions = new Queue<ActionActivator>();
    this._activeActionActivators = [];
    if (useTimer) {
      this._gameTimer = new GameTimer(1000 / 1000.0, 100 / 1000.0);
      this._gameTimer.elapsed.listen((_d) => this.activateDelayedActions());
      this._gameTimer.start();
    }
  }

  deinitialize(): void {
    if (this._activeActionActivators) {
      const activators = this._activeActionActivators.slice();
      for (const actionActivator of activators) {
        actionActivator?.end();
      }
    }
    if (this._actions) {
      const actionActivators: ActionActivator[] = [];

      this._actions.forEach((actionActivator) => actionActivators.push(actionActivator));
      for (const actionActivator of actionActivators) {
        actionActivator?.end();
      }
    }
    this._actions?.clear();
    this._activeActionActivators.length = 0;
  }

  private activateDelayedActions(): void {
    if (this.isAnyCollectionRunning) return;

    if (this._actions.size() == 0) {
      this._activeActionActivators.length = 0;
      return;
    }

    this._collectionWorking = true;
    while (this._actions.size() > 0) {
      const currentActionActivator = this._actions.dequeue()!;
      currentActionActivator.start();
      this._activeActionActivators.push(currentActionActivator);
      if (this._sequenceExecution) break;
    }
    this._collectionWorking = false;
  }

  private actionOnDone(): void {
    this.activateDelayedActions();
  }

  private activateActionOnAddActivator(): void {
    this.activateDelayedActions();
  }

  executeDelayedActions(): void {
    this.activateDelayedActions();
  }

  appendActionToLazyExecute(action: Action, executeImmediately: boolean = true): void {
    const actionActivator = new ActionActivator(this._game);
    actionActivator.action = new LazyAction(() => action);
    actionActivator.action.done.listen((_d) => this.actionOnDone());
    this._actions.enqueue(actionActivator);
    if (executeImmediately) {
      this.activateActionOnAddActivator();
    }
  }

  clearNotStartedActions(): void {
    if (!this._actions || !this._actions.size()) return;
    this._actions.clear();
  }

  waitTillCollectionFinished(): Action {
    return new ConditionAction(() => this.isCollectionFinished);
  }

  get isAnyCollectionRunning(): boolean {
    return (
      (this._actions.size() > 0 && this._actions.any((arg) => arg.started)) ||
      this._collectionWorking ||
      (this._activeActionActivators.length != 0 &&
        this._activeActionActivators.some((action) => action.started))
    );
  }

  get isCollectionFinished(): boolean {
    return (
      (this._actions.size() == 0 || this._actions.every((arg) => !arg.started)) &&
      !this.isAnyCollectionRunning
    );
  }
}
