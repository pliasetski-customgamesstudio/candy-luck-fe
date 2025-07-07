import { Container } from '@cgs/syd';
import {
  GameStateMachineNotifierComponent,
  StateMachineListener,
} from './game_state_machine_notifier_component';
import { T_GameStateMachineNotifierComponent } from '../../type_definitions';
import { ISpinResponse } from '@cgs/common';

export class EndFreeSpinTriggerProvider extends StateMachineListener {
  constructor(container: Container) {
    super(container);
    const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    notifierComponent.notifier.AddListener(this);
  }

  onEndFreeSpinsPopupExited(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
    super.onEndFreeSpinsPopupExited(currentResponse, previousResponse);
  }
}
