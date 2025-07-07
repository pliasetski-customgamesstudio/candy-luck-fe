import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class AutomaticBonusRecoveryProvider {
  constructor(container: Container) {
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    gameStateMachine.bonusRecovery.entered.listen((_e) => gameStateMachine.resume());
  }
}
