import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ExtendedGameStateMachine } from '../../../reels_engine/state_machine/extended_game_state_machine';
import { T_IGameStateMachineProvider } from '../../../type_definitions';
import { GameComponentProvider } from '../game_component_provider';

export class ExtendedSlotGameComponentProvider extends GameComponentProvider {
  private _gameStateMachine: ExtendedGameStateMachine<ISpinResponse>;

  constructor(container: Container) {
    super();
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine as ExtendedGameStateMachine<ISpinResponse>;
  }

  get gameStateMachine(): ExtendedGameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  get currentResponse(): ISpinResponse {
    return this._gameStateMachine.curResponse;
  }

  get previousResponse(): ISpinResponse {
    return this._gameStateMachine.prevResponse;
  }

  getSpecialSymbolsByMarker(response: ISpinResponse, marker: string): SpecialSymbolGroup[] {
    return response && response.specialSymbolGroups
      ? response.specialSymbolGroups.filter(
          (s) => !StringUtils.isNullOrEmpty(s.type) && s.type == marker
        )
      : [];
  }

  removeSpecialSymbolsByMarker(response: ISpinResponse, marker: string): void {
    if (response && response.specialSymbolGroups) {
      const symbolsToRemove = response.specialSymbolGroups.filter(
        (s) => !StringUtils.isNullOrEmpty(s.type) && s.type == marker
      );
      for (const symbolToRemove of symbolsToRemove) {
        const index = response.specialSymbolGroups.indexOf(symbolToRemove);
        response.specialSymbolGroups.splice(index, 1);
      }
    }
  }
}
