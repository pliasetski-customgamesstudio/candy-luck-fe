import { Container, FunctionAction } from '@cgs/syd';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
export class EndBonusGameComponent {
  constructor(container: Container) {
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    gameStateMachine.endBonus.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          gameStateMachine.resume();
        })
    );
    gameStateMachine.endScatter.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          gameStateMachine.resume();
        })
    );
  }
}
