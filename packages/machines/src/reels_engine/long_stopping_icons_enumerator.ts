import { Random } from '@cgs/syd';
import { IconEnumerator } from './icon_enumerator';
import { IconDescr } from './long_icon_enumerator';

export class LongStoppingIconEnumerator extends IconEnumerator {
  private _fullReelMask: number;
  private _reelMask: number[];
  private _longIconLength: number;
  private _map: Map<number, number>[];
  private _longIcons: IconDescr[];
  public iconIds: number[];
  public replaceOnReels: number[] | null;
  private replaceId: number;
  private defaultReplaceId: number;
  public isStopping: boolean;

  private readonly _random: Random;

  constructor(
    reelCount: number,
    lineCount: number,
    longIcons: IconDescr[],
    cIconIds: number[],
    cReplaceId: number = 6
  ) {
    super(reelCount, lineCount);
    this.replaceId = cReplaceId;
    this.defaultReplaceId = cReplaceId;
    this.iconIds = cIconIds;
    this._reelMask = new Array<number>(reelCount);
    this._reelCount = reelCount;
    this._fullReelMask = (1 << lineCount) - 1;
    this._longIcons = longIcons;
    this._longIconLength =
      longIcons && longIcons.length > 0
        ? longIcons
            .map((e) => e.length)
            .reduce((prevValue, currValue) => (currValue > prevValue ? currValue : prevValue), 0)
        : 0;

    this._map = new Array(reelCount);
    for (let i = 0; i < reelCount; i++) {
      this._reelMask[i] = 0;
    }

    for (let i = 0; i < reelCount; i++) {
      this._map[i] = new Map<number, number>();
    }

    this._random = new Random();
  }

  public resetReplaceIdToDefault(): void {
    this.replaceId = this.defaultReplaceId;
  }

  public setCustomReplaceId(replacedId: number): void {
    this.replaceId = replacedId;
  }

  private _getIconFromSpinedReels(reelIndex: number, index: number): number {
    const icons = this.spinedReels[reelIndex];

    return icons.reverse()[index] as number;
  }

  public getInitial(reelIndex: number, entityEnumerationIndex: number): number {
    if (entityEnumerationIndex < this.lineCount) {
      this.setMappedWinIndex(reelIndex, entityEnumerationIndex, entityEnumerationIndex);
    }
    const icon = super.getInitial(reelIndex, entityEnumerationIndex);

    if (icon > 0) {
      return icon;
    }

    return this._getRandomRegularIcon(reelIndex);
  }

  public setInitialReels(initialReels: number[][]): void {
    super.initialReels = initialReels;
    for (let i = 0; i < this._reelCount; i++) {
      this.setWinTapes(i, initialReels[i]);
    }
  }

  public getNext(reelIndex: number, enumerationIndex: number): number {
    if (this.spinedReels.length <= 0) {
      return 0;
    }

    let icon = this.tryGetWinIcon(reelIndex, enumerationIndex);
    if (icon !== -1) {
      return icon;
    }

    if (this._map[reelIndex].has(enumerationIndex)) {
      if (this.isStopping) {
        const k = this._map[reelIndex].get(enumerationIndex) as number;
        if (
          this.iconIds.includes(k) &&
          (!this.replaceOnReels || this.replaceOnReels.includes(reelIndex)) &&
          (this.mappedWinIdexes[reelIndex][0] === enumerationIndex - 1 ||
            this.mappedWinIdexes[reelIndex][this.mappedWinIdexes[reelIndex].length - 1] ===
              enumerationIndex + 1)
        ) {
          return this.replaceId;
        }
      }
      return this._map[reelIndex].get(enumerationIndex) as number;
    }

    if (
      this.currentFeatureReelIndex &&
      this.currentFeatureReelIndex.some((cfr) => reelIndex === cfr)
    ) {
      const enumIndex = enumerationIndex % this.featureReel.length;
      return this.featureReel[enumIndex];
    }

    icon = this.tryGetSpinnedIcon(reelIndex, enumerationIndex);
    if (icon !== -1) {
      if (this.isStopping) {
        if (
          this.iconIds.includes(icon) &&
          (!this.replaceOnReels || this.replaceOnReels.includes(reelIndex)) &&
          (this.mappedWinIdexes[reelIndex][0] === enumerationIndex - 1 ||
            this.mappedWinIdexes[reelIndex][this.mappedWinIdexes[reelIndex].length - 1] ===
              enumerationIndex + 1)
        ) {
          return this.replaceId;
        }
      }
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
    const index = entityEnumerationIndex % this.spinedReels[reelIndex].length;

    if (index < this.spinedReels[reelIndex].length) {
      return this._getIconFromSpinedReels(reelIndex, index);
    }
    return -1;
  }

  public setMappedWinIndex(reel: number, line: number, enumerationId: number): void {
    this.mappedWinIdexes[reel][line] = enumerationId;

    this._mapLongIcons(reel);
  }

  public mapSpinedLongIcons(
    reelIndex: number,
    enumerationIndex: number,
    direction: number,
    icon: number
  ): void {
    if (this.isLong(icon) && this._map && this._map.length > reelIndex) {
      const lastIconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(icon / 100))
        ?.length as number;
      for (let i = 1; i < lastIconLength; i++) {
        if (this.isHead(icon) && direction < 0) {
          this._map[reelIndex].set(enumerationIndex - i, icon + i);
        }

        if (this.isTail(icon) && direction > 0) {
          this._map[reelIndex].set(enumerationIndex + i, icon - i);
        }
      }
    }
  }

  public cleareMapedIcons(reel: number): void {
    this._map[reel].clear();
  }

  private _mapLongIcons(reel: number): void {
    this._map[reel].clear();

    this._mapFeatureIcons(reel, this._longIconLength);

    this._mapTopLongIcons(reel);
    this._mapBottomLongIcons(reel);
  }

  private _mapFeatureIcons(reel: number, additionalLinesCount: number): void {
    if (
      this.currentFeatureReelIndex &&
      this.currentFeatureReelIndex.some((cfri) => cfri === reel)
    ) {
      const first = this.mappedWinIdexes[reel][0];

      for (let i = 1; i <= additionalLinesCount; i++) {
        const spinnedIcon = this.tryGetSpinnedIcon(reel, first + i);
        if (spinnedIcon !== -1) {
          this._map[reel].set(first + i, spinnedIcon);
        }
      }
    }
    if (this.nextFeatureReelIndex.some((nfri) => nfri === reel)) {
      const first = this.mappedWinIdexes[reel][0];

      for (let i = 1; i <= additionalLinesCount; i++) {
        const enumIndex = (first + i) % this.featureReel.length;
        this._map[reel].set(first + i, this.featureReel[enumIndex]);
      }
    }
  }

  private _mapTopLongIcons(reel: number): void {
    const first = this.mappedWinIdexes[reel][0];
    if (first === undefined) {
      return;
    }
    let firstIcon = this.tryGetWinIcon(reel, first);

    let div = 0;
    let headEnumerationIndex = first;

    if (this.isLong(firstIcon)) {
      const headIconLength = this._longIcons.find(
        (x) => x.iconIndex === Math.floor(firstIcon / 100)
      )?.length as number;
      div = (firstIcon % 100) % headIconLength;
      headEnumerationIndex = first + div;
    }

    const spinnedIcon = this.tryGetSpinnedIcon(reel, headEnumerationIndex);
    if (this.isLong(spinnedIcon)) {
      const spinnedDiff = spinnedIcon % 100;
      for (let i = 1; i <= spinnedDiff; i++) {
        this._map[reel].set(headEnumerationIndex + i, this._getRandomRegularIcon(reel));
      }
    }

    if (this.isLong(firstIcon)) {
      for (let i = 0; i <= div; i++) {
        this._map[reel].set(first + i, firstIcon);
        firstIcon--;
      }
    }
  }

  private _mapBottomLongIcons(reel: number): void {
    const lastEnumerationIndex = this.mappedWinIdexes[reel][this.mappedWinIdexes[reel].length - 1];
    if (lastEnumerationIndex === undefined) {
      return;
    }
    let lastIcon = this.tryGetWinIcon(reel, lastEnumerationIndex);

    let diff = 0;
    let endEnumerationIndex = lastEnumerationIndex;

    if (this.isLong(lastIcon)) {
      const lastIconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(lastIcon / 100))
        ?.length as number;
      diff = lastIconLength - ((lastIcon % 100) % lastIconLength) - 1;
      endEnumerationIndex = lastEnumerationIndex - diff;
    }

    const spinnedIcon = this.tryGetSpinnedIcon(reel, endEnumerationIndex);
    if (this.isLong(spinnedIcon)) {
      const spinnedDiff = spinnedIcon % 100;
      const spinnedIconLength = this._longIcons.find(
        (x) => x.iconIndex === Math.floor(spinnedIcon / 100)
      )?.length as number;

      for (let i = 1; i <= spinnedIconLength - spinnedDiff - 1; i++) {
        this._map[reel].set(endEnumerationIndex - i, this._getRandomRegularIcon(reel));
      }
    }

    if (this.isLong(lastIcon)) {
      for (let i = 0; i <= diff; i++) {
        this._map[reel].set(lastEnumerationIndex - i, lastIcon);
        lastIcon++;
      }
    }
  }

  private _getRandomRegularIcon(reelIndex: number): number {
    let icon: number;

    do {
      const index = this._random.integer(0, this.spinedReels[reelIndex].length - 1);
      icon = this.spinedReels[reelIndex][index];
    } while (this.isLong(icon));
    return icon;
  }

  private isHead(icon: number): boolean {
    return this.isLong(icon) && icon % 100 === 0;
  }

  private isTail(icon: number): boolean {
    const iconLength = this._longIcons.find((x) => x.iconIndex === Math.floor(icon / 100))
      ?.length as number;
    return this.isLong(icon) && icon % 100 === iconLength - 1;
  }

  public isLong(icon: number): boolean {
    return icon > 100;
  }
}
