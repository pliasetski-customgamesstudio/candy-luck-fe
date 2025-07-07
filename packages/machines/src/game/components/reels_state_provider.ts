import { ISpinResponse, ReelState } from '@cgs/common';
import { IReelsStateProvider } from '../../reels_engine/game_components_providers/i_reels_state_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class ReelsStateProvider implements IReelsStateProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  public get reelsState(): ReelState {
    return this._gameStateMachine.curResponse.reelState;
  }

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }
}
