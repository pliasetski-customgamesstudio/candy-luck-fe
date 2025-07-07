import { Container } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../components/game_state_machine_notifier_component';
import { ISlotView } from './base_slot_view';
import { T_GameStateMachineNotifierComponent } from '../../type_definitions';

export interface ISlotController {
  slotLoadFinished(): void;
}

export class BaseSlotController<T extends ISlotView> implements AbstractListener, ISlotController {
  private _view: T | null;
  protected _container: Container;
  private _notifierComponent: GameStateMachineNotifierComponent;

  get container(): Container {
    return this._container;
  }

  get view(): T {
    return this._view as T;
  }

  set view(value: T) {
    this._view = value;
  }

  get gameStateMachineNotifier(): GameStateMachineNotifierComponent {
    return this._notifierComponent;
  }

  constructor(container: Container, view: T | null) {
    this._container = container;
    this._view = view;
    if (this._view) {
      // HACK FOR TOTAL WIN CONTROLLER
      this._view.initController(this);
    }
    this._notifierComponent = this._container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._notifierComponent.notifier.AddListener(this);
  }

  OnStateEntered(_slotState: string): void {}

  OnStateExited(_slotState: string): void {}

  slotLoadFinished(): void {}
}
