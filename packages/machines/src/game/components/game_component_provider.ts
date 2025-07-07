import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { IGameComponentProvider } from './interfaces/i_game_component_provider';

export class GameComponentProvider implements IGameComponentProvider {
  getSpecSymbolGroupsByMarker(
    response: ISpinResponse,
    marker: string
  ): SpecialSymbolGroup[] | null {
    const symbols = response.specialSymbolGroups;
    return symbols ? symbols.filter((p) => p.type === marker) : null;
  }

  getSpecSymbolGroupsByMarkerAndSymbolId(
    response: ISpinResponse,
    marker: string,
    symbolId: number
  ): SpecialSymbolGroup[] | null {
    const symbols = response.specialSymbolGroups;
    return symbols ? symbols.filter((p) => p.type === marker && p.symbolId === symbolId) : null;
  }

  initialize(): void {}

  deinitialize(): void {}
}
