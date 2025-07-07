import { Container } from '@cgs/syd';
import { StateMachineListener } from '../../../components/game_state_machine_notifier_component';

export class ChallengesStateMachineListener extends StateMachineListener {
  constructor(container: Container) {
    super(container);
  }
}
