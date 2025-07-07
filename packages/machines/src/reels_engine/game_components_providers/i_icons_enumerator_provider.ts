import { InternalReelsConfig } from '../internal_reels_config';

export interface IInitResponsable {
  initResponse: number[][];
}

export interface IInitialReelsProvider {
  getInitialReels(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][];
  getInitialReelsForFakeResponse(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][];
  getSpinedReels(spinedReels: number[][]): number[][];
}
