import { Container } from '@cgs/syd';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import { GambleButtonController } from '../controllers/gamble_button_controller';
import { BaseListener } from './base_listener';

export class GambleButtonListener extends BaseListener<GambleButtonController> {
  constructor(container: Container, controller: GambleButtonController) {
    super(container);
    this.ListenerController = controller;
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.ListenerController.onSpinStarted();
        break;
      case GameStateMachineStates.Scatter:
        this.ListenerController.onGambleStarted();
        break;
    }
  }
}
