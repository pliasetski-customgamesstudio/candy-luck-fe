import { Random } from '@cgs/syd';
import { IconEnumerator } from './icon_enumerator';

export class IconDescr {
  iconIndex: number;
  length: number;
  width: number;
  constructor(iconIndex: number, length: number, width: number = 1) {
    this.iconIndex = iconIndex;
    this.length = length;
    this.width = width;
  }
}

export class LongIconEnumerator extends IconEnumerator {
  private _random: Random;
  private _map: Map<number, Map<number, number>>;
  private _reelMask: number[];
  private _fullReelMask: number;
  private _longIconLength: number;
  protected _longIcons: IconDescr[];

  constructor(reelCount: number, lineCount: number, longIcons: IconDescr[]) {
    super(reelCount, lineCount);
    this._random = new Random();
    this._map = new Map<number, Map<number, number>>();
    this._reelMask = new Array<number>(reelCount);
    this._longIconLength =
      longIcons.length > 0
        ? longIcons
            .map((e) => e.length)
            .reduce((prevValue, currValue) => (currValue > prevValue ? currValue : prevValue))
        : 0;
    this._longIcons = longIcons;

    for (let i = 0; i < reelCount; i++) {
      this._reelMask[i] = 0;
    }

    this._fullReelMask = (1 << lineCount) - 1;

    for (let i = 0; i < reelCount; i++) {
      this._map.set(i, new Map<number, number>());
    }
  }

  private _getIconFromSpinedReels(reelIndex: number, index: number): number {
    return this.spinedReels[reelIndex].slice().reverse()[index];
  }

  getInitial(reelIndex: number, entityEnumerationIndex: number): number {
    if (entityEnumerationIndex < this._lineCount) {
      this.setMappedWinIndex(reelIndex, entityEnumerationIndex, entityEnumerationIndex);
    }
    let icon = super.getInitial(reelIndex, entityEnumerationIndex);

    if (icon > 0) {
      return icon;
    }

    return this._getRandomRegularIcon(reelIndex);
  }

  cleareMapedIcons(reel: number): void {
    this._map.get(reel)?.clear();
  }

  setInitialReels(initialReels: number[][]): void {
    super.initialReels = initialReels;
    for (let i = 0; i < this._reelCount; i++) {
      this.setWinTapes(i, initialReels[i]);
    }
  }

  getNext(reelIndex: number, enumerationIndex: number): number | undefined {
    if (this.spinedReels.length <= 0) {
      return 0;
    }

    let icon = this.tryGetWinIcon(reelIndex, enumerationIndex);
    if (icon !== -1) {
      return icon;
    }

    if (this._map.get(reelIndex)?.has(enumerationIndex)) {
      return this._map.get(reelIndex)?.get(enumerationIndex);
    }

    if (
      this.currentFeatureReelIndex &&
      this.currentFeatureReelIndex.some((cfr) => reelIndex === cfr)
    ) {
      let enumIndex = enumerationIndex % this.featureReel.length;
      return this.featureReel[enumIndex];
    }

    icon = this.tryGetSpinnedIcon(reelIndex, enumerationIndex);
    if (icon !== -1) {
      return icon;
    }
    return 0;
  }

  private tryGetWinIcon(reelIndex: number, entityEnumerationIndex: number): number {
    let winIdx = -1;
    let icon = -1;

    if (this.mappedWinIdexes[reelIndex]) {
      winIdx = this.mappedWinIdexes[reelIndex].indexOf(entityEnumerationIndex);
    }

    if (winIdx !== -1) {
      icon = this.winTapes[reelIndex][winIdx];
    }
    return icon;
  }

  private tryGetSpinnedIcon(reelIndex: number, entityEnumerationIndex: number): number {
    let index = entityEnumerationIndex % this.spinedReels[reelIndex].length;

    if (index < this.spinedReels[reelIndex].length) {
      return this._getIconFromSpinedReels(reelIndex, index);
    }
    return -1;
  }

  setMappedWinIndex(reel: number, line: number, enumerationId: number): void {
    this._reelMask[reel] |= 1 << line;
    this.mappedWinIdexes[reel][line] = enumerationId;

    if (this._reelMask[reel] === this._fullReelMask) {
      this._reelMask[reel] = 0;
      this._mapLongIcons(reel);
    }
  }

  public mapSpinedLongIcons(
    reelIndex: number,
    enumerationIndex: number,
    direction: number,
    icon: number
  ): void {
    if (this.isLong(icon) && this._map && this._map.size > reelIndex) {
      let lastIconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(icon / 100))
        ?.length;
      if (lastIconLength === undefined) {
        throw new Error('lastIconLength is undefined');
      }
      for (let i = 1; i < lastIconLength; i++) {
        if (this.isHead(icon) && direction < 0) {
          this._map.get(reelIndex)?.set(enumerationIndex - i, icon + i);
        }

        if (this.isTail(icon) && direction > 0) {
          this._map.get(reelIndex)?.set(enumerationIndex + i, icon - i);
        }
      }
    }
  }

  private _mapLongIcons(reel: number): void {
    this._map.get(reel)?.clear();

    this._mapFeatureIcons(reel, this._longIconLength);

    this._mapTopLongIcons(reel);
    this._mapBottomLongIcons(reel);
  }

  private _mapFeatureIcons(reel: number, additionalLinesCount: number): void {
    if (
      this.currentFeatureReelIndex &&
      this.currentFeatureReelIndex.some((cfri) => cfri === reel)
    ) {
      let first = this.mappedWinIdexes[reel][0];

      for (let i = 1; i <= additionalLinesCount; i++) {
        let spinnedIcon = this.tryGetSpinnedIcon(reel, first + i);
        if (spinnedIcon !== -1) {
          this._map.get(reel)?.set(first + i, spinnedIcon);
        }
      }
    }
    if (this.nextFeatureReelIndex.some((nfri) => nfri === reel)) {
      let first = this.mappedWinIdexes[reel][0];

      for (let i = 1; i <= additionalLinesCount; i++) {
        let enumIndex = (first + i) % this.featureReel.length;
        this._map.get(reel)?.set(first + i, this.featureReel[enumIndex]);
      }
    }
  }

  private _mapTopLongIcons(reel: number): void {
    let first = this.mappedWinIdexes[reel][0];
    let firstIcon = this.tryGetWinIcon(reel, first);

    let div = 0;
    let headEnumerationIndex = first;

    if (this.isLong(firstIcon)) {
      let headIconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(firstIcon / 100))
        ?.length;
      if (headIconLength === undefined) {
        throw new Error('headIconLength is undefined');
      }
      div = (firstIcon % 100) % headIconLength;
      headEnumerationIndex = first + div;
    }

    let spinnedIcon = this.tryGetSpinnedIcon(reel, headEnumerationIndex);
    if (this.isLong(spinnedIcon)) {
      let spinnedDiff = spinnedIcon % 100;
      for (let i = 1; i <= spinnedDiff; i++) {
        this._map.get(reel)?.set(headEnumerationIndex + i, this._getRandomRegularIcon(reel));
      }
    }

    for (let i = 0; i <= div; i++) {
      this._map.get(reel)?.set(first + i, firstIcon);
      firstIcon--;
    }
  }

  private _mapBottomLongIcons(reel: number): void {
    let lastEnumerationIndex = this.mappedWinIdexes[reel][this.mappedWinIdexes[reel].length - 1];
    let lastIcon = this.tryGetWinIcon(reel, lastEnumerationIndex);

    let diff = 0;
    let endEnumerationIndex = lastEnumerationIndex;

    if (this.isLong(lastIcon)) {
      let lastIconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(lastIcon / 100))
        ?.length;
      if (lastIconLength === undefined) {
        throw new Error('lastIconLength is undefined');
      }
      diff = lastIconLength - ((lastIcon % 100) % lastIconLength) - 1;
      endEnumerationIndex = lastEnumerationIndex - diff;
    }

    let spinnedIcon = this.tryGetSpinnedIcon(reel, endEnumerationIndex);
    if (this.isLong(spinnedIcon)) {
      let spinnedDiff = spinnedIcon % 100;
      let spinnedIconLength = this._longIcons.find(
        (x) => x.iconIndex === Math.floor(spinnedIcon / 100)
      )?.length;
      if (spinnedIconLength === undefined) {
        throw new Error('spinnedIconLength is undefined');
      }
      for (let i = 1; i <= spinnedIconLength - spinnedDiff - 1; i++) {
        this._map.get(reel)?.set(endEnumerationIndex - i, this._getRandomRegularIcon(reel));
      }
    }

    for (let i = 0; i <= diff; i++) {
      this._map.get(reel)?.set(lastEnumerationIndex - i, lastIcon);
      lastIcon++;
    }
  }

  private _getRandomRegularIcon(reelIndex: number): number {
    let icon: number;

    do {
      let index = this._random.integer(0, this.spinedReels[reelIndex].length - 1);
      icon = this.spinedReels[reelIndex][index];
    } while (this.isLong(icon));
    return icon;
  }

  private isHead(icon: number): boolean {
    return this.isLong(icon) && icon % 100 === 0;
  }

  private isTail(icon: number): boolean {
    let iconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(icon / 100))?.length;
    if (iconLength === undefined) {
      throw new Error('iconLength is undefined');
    }
    return this.isLong(icon) && icon % 100 === iconLength - 1;
  }

  public isLong(icon: number): boolean {
    return icon > 100;
  }
}
