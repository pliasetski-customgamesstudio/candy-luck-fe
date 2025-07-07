import { ISpinResponse } from '@cgs/common';
import { GameStateMachine } from '../state_machine/game_state_machine';

export interface IGameStateMachineProvider {
  gameStateMachine: GameStateMachine<ISpinResponse>;
  deinitialize(): void;
}
