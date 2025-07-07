import { Container, Random } from '@cgs/syd';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { InternalReelsConfig } from '../../../reels_engine/internal_reels_config';
import { T_IGameConfigProvider } from '../../../type_definitions';

export class InitialReelsComponent {
  static readonly MaxReelGenerateAttempts: number = 100;

  public container: Container;
  protected _iconLimits: Map<number, number> | null;
  protected readonly _random: Random = new Random();
  private _init: number[][];

  constructor(container: Container, iconLimits: Map<number, number> | null = null) {
    this.container = container;
    this._iconLimits = iconLimits;
  }

  get iconLimits(): Map<number, number> | null {
    return this._iconLimits;
  }
  get init(): number[][] {
    return this._init;
  }
  set init(value: number[][]) {
    this._init = value;
  }

  get random(): Random {
    return this._random;
  }

  getInitialReels(
    reelsCount: number,
    linesCount: number,
    _internalConfig: InternalReelsConfig
  ): number[][] {
    const gameConfig =
      this.container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    const spinnedReels: number[][] =
      gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;

    this._init = new Array(reelsCount);
    const limitedIcons: Map<number, number> = new Map();
    const tempLimits: Map<number, number> = new Map();
    if (this._iconLimits) {
      this._iconLimits.forEach((key, _value) => limitedIcons.set(key, 0));
      this._iconLimits.forEach((key, _value) => tempLimits.set(key, 0));
    }
    for (let reel = 0; reel < reelsCount; ++reel) {
      const spinedReel = spinnedReels[reel];

      let initTape: (number | null)[] = Array(linesCount).fill(null);
      let attempts = 0;
      while (++attempts < InitialReelsComponent.MaxReelGenerateAttempts) {
        const index =
          spinedReel.length - linesCount <= 0
            ? 0
            : this._random.nextInt(spinedReel.length - linesCount);
        if (spinedReel[index] > 99) {
          continue;
        }

        initTape = spinedReel.slice(index, index + linesCount);

        if (this._iconLimits) {
          for (let i = 0; i < initTape.length; i++) {
            const iconId = initTape[i] as number;
            if (tempLimits.has(iconId)) {
              tempLimits.set(iconId, (tempLimits.get(iconId) as number) + 1);
            }

            const limitIcon = this._iconLimits.get(iconId) as number;
            const tempLimitIcon = tempLimits.get(iconId) as number;
            if (
              this._iconLimits.has(iconId) &&
              tempLimits.has(iconId) &&
              limitIcon < tempLimitIcon
            ) {
              const forbiddenIcons: number[] = [];
              this._iconLimits.forEach((key, value) => {
                if ((tempLimits.get(key) as number) >= value) {
                  forbiddenIcons.push(key);
                }
              });

              /*if (reel == 1) {
                forbiddenIcons.push(...this._init[0]);
              }

              if (reel == reelsCount - 1) {
                forbiddenIcons.push(...this._init[reelsCount - 2]);
              }*/

              initTape[i] =
                spinedReel.find((icon) => icon <= 99 && !forbiddenIcons.includes(icon)) || null;
              if (typeof initTape[i] !== 'number') {
                initTape[i] = spinedReel.find((icon) => icon <= 99) as number;
              }

              const initTapeIcon = initTape[i] as number;
              if (tempLimits.has(initTapeIcon)) {
                tempLimits.set(initTapeIcon, (tempLimits.get(initTapeIcon) as number) + 1);
              }
            }
          }
        }

        const initTapeDivided = initTape.map((iconId) =>
          (iconId as number) > 100 ? Math.floor((iconId as number) / 100) : iconId
        );
        if (
          (reel == 1 &&
            this._init[0]
              .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
              .filter((iconId) => initTapeDivided.includes(iconId)).length > 0) ||
          (reel == reelsCount - 1 &&
            this._init[reelsCount - 2]
              .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
              .filter((iconId) => initTapeDivided.includes(iconId)).length > 0)
        ) {
          continue;
        }

        for (let icon of initTape) {
          icon = icon as number;
          if (limitedIcons && limitedIcons.has(icon)) {
            limitedIcons.set(icon, (limitedIcons.get(icon) as number) + 1);
          }
        }
        break;
      }

      this._init[reel] = initTape.slice() as number[];
    }

    return this._init;
  }

  getInitReels(): number[][] {
    return this._init;
  }

  getSpinnedReels(spinedReels: number[][]): number[][] {
    return spinedReels;
  }
}
