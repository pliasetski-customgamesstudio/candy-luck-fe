import { Container, Random } from '@cgs/syd';
import { GameComponentProvider } from './game/components/game_component_provider';
import { IInitialReelsProvider } from './reels_engine/game_components_providers/i_icons_enumerator_provider';
import { AbstractGameConfig } from './reels_engine/game_config/abstract_game_config';
import { InternalReelsConfig } from './reels_engine/internal_reels_config';
import { IGameConfigProvider } from './game/components/interfaces/i_game_config_provider';
import { T_IGameConfigProvider } from './type_definitions';

export class InitialReelsProvider extends GameComponentProvider implements IInitialReelsProvider {
  private static readonly MaxReelGenerateAttempts = 100;

  private _container: Container;
  private _iconLimits: Map<number, number> | null;
  private _additionalLinesUp: number;
  private _additionalLinesBottom: number;
  private _init: number[][];
  private _rnd: Random;

  constructor(container: Container, iconLimits: Map<number, number> | null = null) {
    super();
    this._container = container;
    this._iconLimits = iconLimits;
    this._rnd = new Random();
  }

  getInitialReels(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][] {
    const gameConfig: AbstractGameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    const spinnedReels = gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;

    const additionalLinesCount = internalReelsConfig.additionalLines;
    const totalLinesCount = linesCount + additionalLinesCount;
    this._additionalLinesUp = internalReelsConfig.additionalUpLines;
    this._additionalLinesBottom = internalReelsConfig.additionalBottomLines;

    this._init = new Array(reelsCount);
    let limitedIcons: Map<number, number> | null = null;
    let tempLimits: Map<number, number> | null = null;
    if (this._iconLimits) {
      limitedIcons = new Map<number, number>();
      this._iconLimits.forEach((value, key) => limitedIcons!.set(key, 0));
      tempLimits = new Map<number, number>();
      this._iconLimits.forEach((value, key) => tempLimits!.set(key, 0));
    }
    for (let reel = 0; reel < reelsCount; ++reel) {
      const spinedReel = spinnedReels[reel];

      let initTape = new Array(totalLinesCount);
      let attempts = 0;
      while (++attempts < InitialReelsProvider.MaxReelGenerateAttempts) {
        const index = this._rnd.nextInt(spinedReel.length - totalLinesCount);
        if (spinedReel[index] > 99) {
          continue;
        }

        initTape = spinedReel.slice(index, index + totalLinesCount);

        if (this._iconLimits) {
          for (let i = 0; i < initTape.length; i++) {
            const iconId = initTape[i];
            if (tempLimits!.has(iconId)) {
              tempLimits!.set(iconId, tempLimits!.get(iconId)! + 1);
            }

            if (
              this._iconLimits.has(iconId) &&
              tempLimits!.has(iconId) &&
              this._iconLimits.get(iconId)! < tempLimits!.get(iconId)!
            ) {
              const forbiddenIcons: number[] = [];
              this._iconLimits.forEach((value, key) => {
                if (tempLimits!.get(key)! >= value) {
                  forbiddenIcons.push(key);
                }
              });

              if (reel === 1) {
                forbiddenIcons.push(...this._init[0]);
              }

              if (reel === reelsCount - 1) {
                forbiddenIcons.push(...this._init[reelsCount - 2]);
              }

              const newIcon = spinedReel.find(
                (icon) => icon <= 99 && !forbiddenIcons.includes(icon)
              );
              initTape[i] =
                newIcon !== undefined ? newIcon : spinedReel.find((icon) => icon <= 99)!;

              if (tempLimits!.has(initTape[i])) {
                tempLimits!.set(initTape[i], tempLimits!.get(initTape[i])! + 1);
              }
            }
          }
        }

        const initTapeDivided = initTape
          .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
          .slice(this._additionalLinesUp, this._additionalLinesUp + linesCount);
        if (
          (reel === 1 &&
            this._init[0]
              .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
              .some((iconId) => initTapeDivided.includes(iconId))) ||
          (reel === reelsCount - 1 &&
            this._init[reelsCount - 2]
              .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
              .some((iconId) => initTapeDivided.includes(iconId)))
        ) {
          continue;
        }

        for (const icon of initTape) {
          if (limitedIcons && limitedIcons.has(icon)) {
            limitedIcons.set(icon, limitedIcons.get(icon)! + 1);
          }
        }
        break;
      }

      this._init[reel] = initTape.slice(
        this._additionalLinesUp,
        this._additionalLinesUp + linesCount
      );
    }

    return this._init;
  }

  getInitialReelsForFakeResponse(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][] {
    return this.getInitialReels(reelsCount, linesCount, internalReelsConfig);
  }

  getSpinedReels(spinedReels: number[][]): number[][] {
    return spinedReels;
  }
}
