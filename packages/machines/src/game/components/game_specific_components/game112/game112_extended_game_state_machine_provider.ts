import { ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import { GameComponentProvider } from '../../game_component_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ResponseProvider } from '../../../../reels_engine/reel_net_api/response_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { T_ResponseProvider } from '../../../../type_definitions';
import { Game112ExtendedGameStateMachine } from './game112_extended_game_state_machine';

export class Game112ExtendedGameStateMachineProvider
  extends GameComponentProvider
  implements IGameStateMachineProvider
{
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(c: Container, shortWinLinesGroupNames: string[] | null = null) {
    super();
    const responseProvider = c.forceResolve<ResponseProvider<ISpinResponse>>(
      T_ResponseProvider
    ) as ResponseProvider<ISpinResponse>;
    this._gameStateMachine = new Game112ExtendedGameStateMachine<ISpinResponse>(
      c,
      responseProvider,
      shortWinLinesGroupNames as string[]
    );
  }

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  set gameStateMachine(value: GameStateMachine<ISpinResponse>) {
    this._gameStateMachine = value;
  }

  deinitialize(): void {
    super.deinitialize();
    this.gameStateMachine.interrupt();
  }
}
