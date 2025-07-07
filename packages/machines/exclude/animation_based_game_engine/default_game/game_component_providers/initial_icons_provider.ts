import { Random } from 'dart:math';
import { Container } from 'package:syd/syd.dart';
import { IconModelComponent } from 'package:machines/src/reels_engine_library.dart';

export interface IInitialIconsProvider {
  getInitialIcons(iconsCount: number): number[];
}

class InitialIconsProvider implements IInitialIconsProvider {
  private readonly MaxIconGenerateAttempts: number = 100;
  private readonly _random: Random = new Random();
  private _iconModel: IconModelComponent;
  private readonly _allowRepeatedIcons: boolean;
  private _iconLimits: Map<number, number>;
  private _container: Container;

  constructor(
    container: Container,
    allowRepeatedIcons: boolean,
    iconLimits: Map<number, number> | null = null
  ) {
    this._container = container;
    this._iconLimits = iconLimits;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._allowRepeatedIcons = allowRepeatedIcons;
  }

  public getInitialIcons(iconsCount: number): number[] {
    return this._allowRepeatedIcons
      ? this.getIcons(iconsCount)
      : this.getNotRepeatedIcons(iconsCount);
  }

  private getIcons(iconsCount: number): number[] {
    const gameParams = this._container.forceResolve<IGameParams>(T_IGameParams);
    const gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    const spinnedReels = gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;
    const totalLinesCount = gameParams.maxIconsPerGroup;
    const init: number[] = new Array(iconsCount);

    for (let i = 0; i < iconsCount; i++) {
      const reel = Math.floor(i / gameParams.maxIconsPerGroup);
      const spinnedReel = spinnedReels[reel];
      let attempts = 0;
      while (++attempts < this.MaxIconGenerateAttempts) {
        init[i] = spinnedReel[this._random.nextInt(spinnedReel.length - totalLinesCount)];
        if (!this._iconModel.hasStaticIcon(init[i])) {
          continue;
        }
        if (
          this._iconLimits &&
          this._iconLimits.has(init[i]) &&
          init.filter((x) => x === init[i]).length >= this._iconLimits.get(init[i])
        ) {
          continue;
        }
        break;
      }
    }

    return init;
  }

  private getNotRepeatedIcons(iconsCount: number): number[] {
    const iconsList: number[] = [];
    for (let i = this._iconModel.minStaticIconId; i <= this._iconModel.maxStaticIconId; i++) {
      if (this._iconModel.hasStaticIcon(i)) {
        iconsList.push(i);
      }
    }

    iconsList.shuffle();

    return iconsList.slice(0, iconsCount);
  }
}
