export class IconEnumerator {
  protected _reelCount: number;
  protected _lineCount: number;
  protected _initialReels: number[][];
  protected _spinedReels: number[][];
  protected _winTapes: number[][];
  protected _mappedWinIdexes: number[][];
  protected _featureReel: number[];
  protected _currentFeatureReelIndex: number[];
  protected _nextFeatureReelIndex: number[];

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

  constructor(reelCount: number, lineCount: number) {
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

  getNext(reelIndex: number, entityEnumerationIndex: number): number | undefined {
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
