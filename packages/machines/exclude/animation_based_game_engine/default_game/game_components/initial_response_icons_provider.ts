import { Random } from 'dart:math';
import { IInitialReelsProvider } from 'package:machines/machines.dart';
import { GameComponentProvider } from 'package:syd/syd.dart';
import {
  IGameStateMachineProvider,
  ISpinResponse,
} from 'package:machines/src/reels_engine_library.dart';
import { IGameConfigProvider } from 'package:common/common.dart';

class InitialResponseReelsProvider extends GameComponentProvider implements IInitialReelsProvider {
  private _container: Container;
  private MaxReelGenerateAttempts: number = 100;
  private _rnd: Random = new Random();
  private _init: number[][];
  private _additionalLinesUp: number;
  private _additionalLinesBottom: number;
  private _iconLimits: Map<number, number>;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container, iconLimits: Map<number, number> = null) {
    super();
    this._container = container;
    this._iconLimits = iconLimits;
  }

  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    if (!this._gameStateMachine) {
      this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    }
    return this._gameStateMachine;
  }

  get InitResponse(): number[][] {
    let result: number[][] = null;
    if (this._init && this._init.length != 0) {
      result = [];
      for (let i = 0; i < this._init.length; ++i) {
        result.push([]);
        for (
          let j = this._additionalLinesUp;
          j < this._init[i].length - this._additionalLinesBottom;
          ++j
        ) {
          result[i].push(this._init[i][j]);
        }
      }
    }
    return result;
  }

  getInitialReels(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][] {
    const gameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    const spinnedReels = gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;

    const additionalLinesCount = internalReelsConfig.additionalLines;
    const totalLinesCount = (linesCount + additionalLinesCount) as number;
    this._additionalLinesUp = internalReelsConfig.additionalUpLines;
    this._additionalLinesBottom = internalReelsConfig.additionalBottomLines;

    this._init = new Array(reelsCount);
    let limitedIcons: Map<number, number>;
    let tempLimits: Map<number, number>;
    if (this._iconLimits) {
      limitedIcons = new Map<number, number>();
      this._iconLimits.forEach((key, value) => limitedIcons.set(key, 0));
      tempLimits = new Map<number, number>();
      this._iconLimits.forEach((key, value) => tempLimits.set(key, 0));
    }
    for (let reel = 0; reel < reelsCount; ++reel) {
      const spinedReel = spinnedReels[reel];

      const initTape = new Array(totalLinesCount);
      let attempts = 0;
      if (this.gameStateMachine.curResponse && this.gameStateMachine.curResponse.viewReels) {
        for (let line = 0; line < totalLinesCount; line++) {
          if (
            line >= internalReelsConfig.additionalUpLines &&
            line < totalLinesCount - internalReelsConfig.additionalBottomLines
          ) {
            initTape[line] =
              this.gameStateMachine.curResponse.viewReels[reel][
                line - internalReelsConfig.additionalUpLines
              ];
          } else {
            while (++attempts < this.MaxReelGenerateAttempts) {
              const index = this._rnd.nextInt(spinedReel.length - totalLinesCount);
              if (spinedReel[index] > 99) {
                continue;
              }

              initTape[line] = spinedReel[index];
              break;
            }
          }
        }
      } else {
        while (++attempts < this.MaxReelGenerateAttempts) {
          const index = this._rnd.nextInt(spinedReel.length - totalLinesCount);
          if (spinedReel[index] > 99) {
            continue;
          }

          initTape = spinedReel.slice(index, index + totalLinesCount);

          if (this._iconLimits) {
            for (let i = 0; i < initTape.length; i++) {
              const iconId = initTape[i];
              if (tempLimits.has(iconId)) {
                tempLimits.set(iconId, tempLimits.get(iconId) + 1);
              }

              if (
                this._iconLimits.has(iconId) &&
                tempLimits.has(iconId) &&
                this._iconLimits.get(iconId) < tempLimits.get(iconId)
              ) {
                const forbiddenIcons: number[] = [];
                this._iconLimits.forEach((key, value) => {
                  if (tempLimits.get(key) >= value) {
                    forbiddenIcons.push(key);
                  }
                });
                if (reel == 1) {
                  forbiddenIcons.push(...this._init[0]);
                }

                if (reel == reelsCount - 1) {
                  forbiddenIcons.push(...this._init[reelsCount - 2]);
                }

                initTape[i] = spinedReel.find(
                  (icon) => icon <= 99 && !forbiddenIcons.includes(icon)
                )
                  ? spinedReel.find((icon) => icon <= 99 && !forbiddenIcons.includes(icon))
                  : spinedReel.find((icon) => icon <= 99);
                if (tempLimits.has(initTape[i])) {
                  tempLimits.set(initTape[i], tempLimits.get(initTape[i]) + 1);
                }
              }
            }
          }

          const initTapeDivided = initTape
            .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
            .slice(this._additionalLinesUp, this._additionalLinesUp + linesCount);
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

          for (const icon of initTape) {
            if (limitedIcons && limitedIcons.has(icon)) {
              limitedIcons.set(icon, limitedIcons.get(icon) + 1);
            }
          }

          break;
        }
      }

      this._init[reel] = initTape;
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
