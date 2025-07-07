import { Container } from '@cgs/syd';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class RebuyInfoComponent {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _container: Container;

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  public getFreeSpinsCount(): number {
    return 0;
  }

  public getFreeSpinsName(): string {
    return FreeSpinsInfoConstants.FreeFreeSpinsGroupName;
  }
}
