import { Logger } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import { SpinViewMachineListener } from './spin_view_machine_listener';

export class FreeFallSpinViewMachineListener extends SpinViewMachineListener {
  constructor(container: Container) {
    super(container);
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Collapse:
        this.viewController.disableSpinButton();
        break;
      default:
        Logger.Debug('call default OnStateEntered: ' + slotState);
        super.OnStateEntered(slotState);
    }
  }
}
