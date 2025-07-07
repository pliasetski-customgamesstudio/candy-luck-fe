import { Container } from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../../components/game_state_machine_notifier_component';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import {
  T_GameStateMachineNotifierComponent,
  T_ISlotSessionProvider,
} from '../../../../type_definitions';

export class BaseListener<TListener> implements AbstractListener {
  ListenerController: TListener;
  protected _slotSession: SlotSession;
  private _notifierComponent: GameStateMachineNotifierComponent;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    this._notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._notifierComponent.notifier.AddListener(this);
  }

  OnStateEntered(slotState: string): void {
    // TODO: implement OnStateEntered
  }

  OnStateExited(slotState: string): void {
    // TODO: implement OnStateExited
  }
}
