import { ISpinResponse, SpecialSymbolGroup, InternalRespinRound } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { GameComponentProvider } from './game_component_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class ResponseDependentGameComponentProvider extends GameComponentProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  get currentResponse(): ISpinResponse {
    return this._gameStateMachine.curResponse;
  }
  get previousResponse(): ISpinResponse {
    return this._gameStateMachine.prevResponse;
  }

  constructor(container: Container) {
    super();
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  getSpecialSymbolsByMarker(response: ISpinResponse, marker: string): SpecialSymbolGroup[] {
    return response && response.specialSymbolGroups
      ? response.specialSymbolGroups.filter((s) => s.type && s.type === marker)
      : [];
  }

  removeSpecialSymbolsByMarker(response: ISpinResponse, marker: string): void {
    if (response && response.specialSymbolGroups) {
      const symbolsToRemove = response.specialSymbolGroups.filter(
        (s) => s.type && s.type === marker
      );
      for (const symbolToRemove of symbolsToRemove) {
        const index = response.specialSymbolGroups.indexOf(symbolToRemove);
        response.specialSymbolGroups.splice(index, 1);
      }
    }
  }

  getRespinSpecialSymbolsByMarker(
    respinRound: InternalRespinRound,
    marker: string
  ): SpecialSymbolGroup[] {
    return respinRound && respinRound.specialSymbolGroups
      ? respinRound.specialSymbolGroups.filter((s) => s.type && s.type === marker)
      : [];
  }

  removeRespinSpecialSymbolsByMarker(respinRound: InternalRespinRound, marker: string): void {
    if (respinRound && respinRound.specialSymbolGroups) {
      const symbolsToRemove = respinRound.specialSymbolGroups.filter(
        (s) => s.type && s.type === marker
      );
      for (const symbolToRemove of symbolsToRemove) {
        const index = respinRound.specialSymbolGroups.indexOf(symbolToRemove);
        respinRound.specialSymbolGroups.splice(index, 1);
      }
    }
  }
}
