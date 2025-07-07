import { ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../game_components_providers/i_game_state_machine_provider';
import { ResponseProvider } from '../reel_net_api/response_provider';
import { T_ResponseProvider } from '../../type_definitions';
import { SpinEvent } from './events/spin_event';
import { StopEvent } from './events/stop_event';
import { GameStateMachineWithCustomFreeSpins } from './game_state_machine_with_custom_free_spins';

export class GameStateMachineWithCustomFreeSpinsProvider implements IGameStateMachineProvider {
  private _stateMachine: GameStateMachineWithCustomFreeSpins<ISpinResponse>;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const responseProvider =
      container.forceResolve<ResponseProvider<ISpinResponse>>(T_ResponseProvider);
    this._stateMachine = new GameStateMachineWithCustomFreeSpins(container, responseProvider);
  }

  get gameStateMachine(): GameStateMachineWithCustomFreeSpins<ISpinResponse> {
    return this._stateMachine;
  }

  handleMessage(m: any): boolean {
    if (m instanceof SpinEvent) {
      this._stateMachine.doSpin();
      return true;
    }
    if (m instanceof StopEvent) {
      this._stateMachine.doStop();
      return true;
    }
    return false;
  }

  deinitialize(): void {
    this._stateMachine.interrupt();
  }
}
