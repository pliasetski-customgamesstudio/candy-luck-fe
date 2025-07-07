import { Random } from '@cgs/syd';
import { IconEnumerator } from './icon_enumerator';
import { IconDescr } from './long_icon_enumerator';
import { GameStateMachine } from './state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';

export class LongSpinningIconEnumerator extends IconEnumerator {
  private _random: Random;
  private _map: Map<number, number>[];
  private _reelMask: number[];
  private _fullReelMask: number;
  private _longIconLength: number;
  private _longIcons: IconDescr[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _isLongOnTop: boolean;

  get isLongOnTop(): boolean {
    return this._isLongOnTop;
  }

  constructor(
    reelCount: number,
    lineCount: number,
    longIcons: IconDescr[],
    gameStateMachine: GameStateMachine<ISpinResponse>
  ) {
    super(reelCount, lineCount);
    this._random = new Random();
    this._lineCount = lineCount;
    this._reelCount = reelCount;
    this._map = [];
    this._reelMask = [];
    for (let i = 0; i < reelCount; i++) {
      this._reelMask.push(0);
      this._map.push(new Map<number, number>());
    }
    this._longIconLength =
      longIcons.length > 0
        ? longIcons
            .map((e) => e.length)
            .reduce((prevValue, currValue) => (currValue > prevValue ? currValue : prevValue))
        : 0;
    this._longIcons = longIcons;
    this._gameStateMachine = gameStateMachine;

    for (let i = 0; i < reelCount; i++) {
      this._reelMask[i] = 0;
    }

    this._fullReelMask = (1 << lineCount) - 1;

    for (let i = 0; i < reelCount; i++) {
      this._map[i] = new Map<number, number>();
    }
  }

  private _getIconFromSpinedReels(reelIndex: number, index: number): number {
    const r = this.spinedReels[reelIndex].reverse();
    return r[index];
  }

  getInitial(reelIndex: number, entityEnumerationIndex: number): number {
    if (entityEnumerationIndex < this._lineCount) {
      this.setMappedWinIndex(reelIndex, entityEnumerationIndex, entityEnumerationIndex);
    }
    const icon = super.getInitial(reelIndex, entityEnumerationIndex);

    if (icon > 0) {
      return icon;
    }

    return this._getRandomRegularIcon(reelIndex);
  }

  setInitialReels(initialReels: number[][]): void {
    super.initialReels = initialReels;
    for (let i = 0; i < this._reelCount; i++) {
      this.setWinTapes(i, initialReels[i]);
    }
  }

  getNext(reelIndex: number, enumerationIndex: number): number {
    if (this.spinedReels.length <= 0) {
      return 0;
    }

    let icon = this._tryGetWinIcon(reelIndex, enumerationIndex);
    if (icon != -1) {
      return icon;
    }

    if (this._map[reelIndex].has(enumerationIndex)) {
      if (reelIndex == 1) {
        if (this.isPreTop(icon)) {
          this._isLongOnTop = true;
        } else {
          this._isLongOnTop = false;
        }
      }
      return this._map[reelIndex].get(enumerationIndex) as number;
    }

    if (this.currentFeatureReelIndex?.some((cfr) => reelIndex === cfr)) {
      const enumIndex = enumerationIndex % this.featureReel.length;
      return this.featureReel[enumIndex];
    }

    icon = this._tryGetSpinnedIcon(reelIndex, enumerationIndex);
    if (icon != -1) {
      if (reelIndex == 1) {
        if (this.isPreTop(icon)) {
          this._isLongOnTop = true;
        } else {
          this._isLongOnTop = false;
        }
      }
      return icon;
    }
    return 0;
  }

  private _tryGetWinIcon(reelIndex: number, entityEnumerationIndex: number): number {
    let winIdx = -1;
    let icon = -1;

    if (this.mappedWinIdexes[reelIndex]) {
      winIdx = this.mappedWinIdexes[reelIndex].indexOf(entityEnumerationIndex);
    }

    if (winIdx != -1) {
      icon = this.winTapes[reelIndex][winIdx];
    }
    return icon;
  }

  private _tryGetSpinnedIcon(reelIndex: number, entityEnumerationIndex: number): number {
    const index = entityEnumerationIndex % this.spinedReels[reelIndex].length;

    if (index < this.spinedReels[reelIndex].length) {
      return this._getIconFromSpinedReels(reelIndex, index);
    }
    return -1;
  }

  setMappedWinIndex(reel: number, line: number, enumerationId: number): void {
    this.mappedWinIdexes[reel][line] = enumerationId;

    this._mapLongIcons(reel);
  }

  private mapSpinedLongIcons(
    reelIndex: number,
    enumerationIndex: number,
    direction: number,
    icon: number
  ): void {
    if (this.isLong(icon) && this._map && this._map.length > reelIndex) {
      const val = Math.floor(icon / 100);
      const lastIconLength = this._longIcons.find((x) => x.iconIndex == val)?.length || 0;
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

  private _mapLongIcons(reel: number): void {
    this._map[reel].clear();

    this._mapFeatureIcons(reel, this._longIconLength);

    this._mapTopLongIcons(reel);
    this._mapBottomLongIcons(reel);
  }

  private _mapFeatureIcons(reel: number, additionalLinesCount: number): void {
    if (this.currentFeatureReelIndex && this.currentFeatureReelIndex.some((cfri) => cfri == reel)) {
      const first = this.mappedWinIdexes[reel][0];

      for (let i = 1; i <= additionalLinesCount; i++) {
        const spinnedIcon = this._tryGetSpinnedIcon(reel, first + i);
        if (spinnedIcon != -1) {
          this._map[reel].set(first + i, spinnedIcon);
        }
      }
    }
    if (this.nextFeatureReelIndex.some((nfri) => nfri == reel)) {
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
    let firstIcon = this._tryGetWinIcon(reel, first);

    let div = 0;
    let headEnumerationIndex = first;

    if (this.isLong(firstIcon)) {
      const headIconLength =
        this._longIcons.find((x) => x.iconIndex == Math.floor(firstIcon / 100))?.length || 0;
      div = (firstIcon % 100) % headIconLength;
      headEnumerationIndex = first + div;
    }

    const spinnedIcon = this._tryGetSpinnedIcon(reel, headEnumerationIndex);
    if (this.isLong(spinnedIcon)) {
      const spinnedDiff = (spinnedIcon % 100) % 3;
      for (let i = 1; i <= spinnedDiff; i++) {
        this._map[reel].set(
          headEnumerationIndex + i,
          this._map[reel].has(headEnumerationIndex + i + spinnedDiff)
            ? (this._map[reel].get(headEnumerationIndex + i + spinnedDiff) as number)
            : 50
        );
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
    if (typeof lastEnumerationIndex !== 'number') {
      return;
    }
    let lastIcon = this._tryGetWinIcon(reel, lastEnumerationIndex);

    let diff = 0;
    let endEnumerationIndex = lastEnumerationIndex;

    if (this.isLong(lastIcon)) {
      const lastIconLength =
        this._longIcons.find((x) => x.iconIndex == Math.floor(lastIcon / 100))?.length || 0;
      diff = lastIconLength - ((lastIcon % 100) % lastIconLength) - 1;
      endEnumerationIndex = lastEnumerationIndex - diff;
    }

    const spinnedIcon = this._tryGetSpinnedIcon(reel, endEnumerationIndex);
    if (this.isLong(spinnedIcon)) {
      const spinnedDiff = (spinnedIcon % 100) % 3;
      const spinnedIconLength = this._longIcons.find(
        (x) => x.iconIndex == Math.floor(spinnedIcon / 100)
      )?.length as number;

      for (let i = 1; i <= spinnedIconLength - spinnedDiff - 1; i++) {
        this._map[reel].set(
          endEnumerationIndex - i,
          this._map[reel].has(endEnumerationIndex - i - spinnedDiff)
            ? (this._map[reel].get(endEnumerationIndex - i - spinnedDiff) as number)
            : 50
        );
      }
    }

    if (this.isLong(lastIcon)) {
      for (let i = 0; i <= diff; i++) {
        this._map[reel].set(lastEnumerationIndex - i, lastIcon);
        lastIcon++;
      }
    }
  }

  private _getRandomRegularIcon(_reelIndex: number): number {
    let icon: number;

    do {
      icon = 50;
    } while (this.isLong(icon));
    return icon;
  }

  private isHead(icon: number): boolean {
    return this.isLong(icon) && icon % 100 == 0;
  }

  private isTail(icon: number): boolean {
    const iconLength = this._longIcons.find((x) => x.iconIndex == Math.floor(icon / 100))
      ?.length as number;
    return this.isLong(icon) && icon % 100 == iconLength - 1;
  }

  private isTop(icon: number): boolean {
    const iconLength = this.isLong(icon)
      ? (this._longIcons.find((x) => x.iconIndex == Math.floor(icon / 100))?.length as number)
      : 1;
    return this.isLong(icon) && (icon % 100) % iconLength == 0;
  }

  private isPreTop(icon: number): boolean {
    const iconLength = this.isLong(icon)
      ? (this._longIcons.find((x) => x.iconIndex == Math.floor(icon / 100))?.length as number)
      : 1;
    return this.isLong(icon) && (icon % 100) % iconLength == 1;
  }

  private isBot(icon: number): boolean {
    const iconLength = this.isLong(icon)
      ? (this._longIcons.find((x) => x.iconIndex == Math.floor(icon / 100))?.length as number)
      : 1;
    return this.isLong(icon) && (icon % 100) % iconLength == iconLength - 1;
  }

  private isLong(icon: number): boolean {
    return icon > 100;
  }
}
