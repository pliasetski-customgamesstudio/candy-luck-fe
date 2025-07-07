import { IconEnumerator } from '../../reels_engine/icon_enumerator';

export class StoppingIconEnumerator extends IconEnumerator {
  _iconIds: number[];
  replaceId: number;
  defaultReplaceId: number;
  isStopping: boolean = false;

  get lineCount(): number {
    return this._lineCount;
  }

  get initialReels(): number[][] {
    return this._initialReels;
  }

  set initialReels(value: number[][]) {
    this._initialReels = value;
  }

  get spinedReels(): number[][] {
    return this._spinedReels;
  }

  get winTapes(): number[][] {
    return this._winTapes;
  }

  get mappedWinIdexes(): number[][] {
    return this._mappedWinIdexes;
  }

  get featureReel(): number[] {
    return this._featureReel;
  }

  get currentFeatureReelIndex(): number[] {
    return this._currentFeatureReelIndex;
  }

  get nextFeatureReelIndex(): number[] {
    return this._nextFeatureReelIndex || [];
  }

  constructor(
    reelCount: number,
    lineCount: number,
    iconIds: number[],
    replaceWithIconId: number = 6
  ) {
    super(reelCount, lineCount);
    this._iconIds = iconIds;
    this.replaceId = replaceWithIconId;
    this.defaultReplaceId = replaceWithIconId;
    this._reelCount = reelCount;
    this._lineCount = lineCount;
    this._winTapes = new Array(reelCount);
    this._mappedWinIdexes = new Array(reelCount);
    for (let reel = 0; reel < reelCount; ++reel) {
      this._mappedWinIdexes[reel] = new Array(lineCount);
    }
  }

  setInitialReels(initialReels: number[][]): void {
    this._initialReels = initialReels;
  }

  setSpinedReels(spinedReels: number[][]): void {
    this._spinedReels = spinedReels;
  }

  getSpinedReels(): number[][] {
    return this._spinedReels;
  }

  setFeatureReel(featureReel: number[]): void {
    this._featureReel = featureReel;
  }

  setCurrentFeatureReelIndexes(currentFeatureReelIndex: number[]): void {
    this._currentFeatureReelIndex = currentFeatureReelIndex;
  }

  setNextFeatureReelIndexes(nextFeatureReelIndex: number[]): void {
    this._nextFeatureReelIndex = nextFeatureReelIndex;
  }

  getNext(reelIndex: number, entityEnumerationIndex: number): number {
    if (reelIndex < this._spinedReels.length && this._spinedReels[reelIndex].length > 0) {
      const winIdx = this._mappedWinIdexes[reelIndex].indexOf(entityEnumerationIndex);
      if (winIdx !== -1) {
        return this._winTapes[reelIndex][winIdx];
      } else {
        if (
          this._currentFeatureReelIndex &&
          this._currentFeatureReelIndex.filter((s) => s === reelIndex).length > 0
        ) {
          const enumIndex = entityEnumerationIndex % this._featureReel.length;
          return this._featureReel[enumIndex];
        }

        const index = entityEnumerationIndex % this._spinedReels[reelIndex].length;

        if (this.isStopping) {
          if (
            this._iconIds.includes(this._spinedReels[reelIndex][index]) &&
            (this._mappedWinIdexes[reelIndex][0] === entityEnumerationIndex - 1 ||
              this._mappedWinIdexes[reelIndex][this._mappedWinIdexes[reelIndex].length - 1] ===
                entityEnumerationIndex + 1)
          ) {
            return this.replaceId;
          }
        }

        return this._spinedReels[reelIndex][index];
      }
    }
    return 0;
  }

  getInitial(reelIndex: number, entityEnumerationIndex: number): number {
    if (
      reelIndex < this._initialReels.length &&
      entityEnumerationIndex < this._initialReels[reelIndex].length
    ) {
      return this._initialReels[reelIndex][entityEnumerationIndex];
    }
    return 0;
  }

  setWinTapes(reel: number, tapes: number[]): void {
    this._winTapes[reel] = [...tapes];
  }

  setMappedWinIndex(reel: number, line: number, enumerationId: number): void {
    this._mappedWinIdexes[reel][line] = enumerationId;
  }

  setWinIndex(reel: number, line: number, winIndex: number): void {
    if (!this._winTapes[reel]) {
      this._winTapes[reel] = new Array(this._lineCount);
    }

    this._winTapes[reel][line] = winIndex;
  }
}
