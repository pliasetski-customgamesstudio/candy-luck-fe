import { IActionNodeStrategy } from './i_action_node_strategy';
import { BreakerContext } from '../contexts/breaker_context';
import { Container } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../game_state_machine_notifier_component';
import { T_GameStateMachineNotifierComponent } from '../../../../type_definitions';
import { IBreakeable } from '../progressive_breaker/ibreakeable';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';

export class ProgressiveBreakerStrategy
  implements IActionNodeStrategy<BreakerContext>, AbstractListener
{
  private _container: Container;
  private _isStopAction: boolean;

  constructor(container: Container) {
    this._container = container;
    const notifierComponent = this._container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    notifierComponent.notifier.AddListener(this);
  }

  performStrategy(actionContext: BreakerContext): void {
    if (this._isStopAction === true) {
      actionContext.breakeableProviders.forEach((item: any) => {
        const provider = this._container.resolve(item) as IBreakeable;
        if (provider) {
          provider.doBreak();
        }
      });
    }
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this._isStopAction = false;
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Stopping:
        this._isStopAction = true;
        break;
    }
  }
}
