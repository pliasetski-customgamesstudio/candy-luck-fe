import { SpecialSymbolGroup, SpinResponse } from '@cgs/common';

export interface IGameComponentProvider {
  getSpecSymbolGroupsByMarker(response: SpinResponse, marker: string): SpecialSymbolGroup[] | null;
  initialize(): void;
  deinitialize(): void;
}
