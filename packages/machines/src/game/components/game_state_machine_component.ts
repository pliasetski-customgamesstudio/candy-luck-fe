import { ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ResponseProvider } from '../../reels_engine/reel_net_api/response_provider';
import { SpinEvent } from '../../reels_engine/state_machine/events/spin_event';
import { StopEvent } from '../../reels_engine/state_machine/events/stop_event';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_ResponseProvider } from '../../type_definitions';

export class BonusMessage {
  static readonly Message = new BonusMessage();
}

export class GameStateMachineComponent implements IGameStateMachineProvider {
  private _stateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._stateMachine;
  }

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const responseProvider =
      container.forceResolve<ResponseProvider<ISpinResponse>>(T_ResponseProvider);
    this._stateMachine = new GameStateMachine(container, responseProvider);
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
