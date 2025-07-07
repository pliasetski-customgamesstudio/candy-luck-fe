import { Container, Random } from '@cgs/syd';
import { GameComponentProvider } from './game/components/game_component_provider';
import { IInitialReelsProvider } from './reels_engine/game_components_providers/i_icons_enumerator_provider';
import { GameStateMachine } from './reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { AbstractGameConfig } from './reels_engine/game_config/abstract_game_config';
import { InternalReelsConfig } from './reels_engine/internal_reels_config';
import { T_IGameConfigProvider, T_IGameStateMachineProvider } from './type_definitions';
import { IGameConfigProvider } from './game/components/interfaces/i_game_config_provider';
import { IGameStateMachineProvider } from './reels_engine/game_components_providers/i_game_state_machine_provider';
import { StringUtils } from '@cgs/shared';

export class ResponseInitialReelsProvider
  extends GameComponentProvider
  implements IInitialReelsProvider
{
  static readonly MaxReelGenerateAttempts: number = 100;

  private _container: Container;
  private _iconLimits: Map<number, number> | null;
  private _additionalLinesUp: number;
  private _additionalLinesBottom: number;
  private _init: number[][];
  private _rnd: Random = new Random();
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container, iconLimits: Map<number, number> | null = null) {
    super();
    this._container = container;
    this._iconLimits = iconLimits;
  }

  getInitialReels(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][] {
    const gameConfig: AbstractGameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;

    if (!this._gameStateMachine) {
      this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    }
    let spinnedReels = gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;
    if (this._gameStateMachine.curResponse && this._gameStateMachine.curResponse.isFreeSpins) {
      if (gameConfig.freeSpinConfig.noWinReels.length !== 0) {
        spinnedReels = gameConfig.freeSpinConfig.noWinReels;
      }
    }

    const additionalLinesCount = internalReelsConfig.additionalLines;
    const totalLinesCount = linesCount + additionalLinesCount;
    this._additionalLinesUp = internalReelsConfig.additionalUpLines;
    this._additionalLinesBottom = internalReelsConfig.additionalBottomLines;

    this._init = new Array(reelsCount);
    let limitedIcons: Map<number, number> | null = null;
    let tempLimits: Map<number, number> = new Map<number, number>();
    if (this._iconLimits) {
      limitedIcons = new Map<number, number>();
      this._iconLimits.forEach((value, key) => limitedIcons!.set(key, 0));
      tempLimits = new Map<number, number>();
      this._iconLimits.forEach((value, key) => tempLimits.set(key, 0));
    }
    for (let reel = 0; reel < reelsCount; ++reel) {
      const spinedReel = spinnedReels[reel];

      let initTape = new Array(totalLinesCount);
      let attempts = 0;
      while (++attempts < ResponseInitialReelsProvider.MaxReelGenerateAttempts) {
        const index =
          spinedReel.length - totalLinesCount <= 0
            ? 0
            : this._rnd.nextInt(spinedReel.length - totalLinesCount);
        if (spinedReel[index] > 99) {
          continue;
        }

        initTape = spinedReel.slice(index, index + totalLinesCount);

        if (this._iconLimits) {
          for (let i = 0; i < initTape.length; i++) {
            const iconId = initTape[i];
            if (tempLimits.has(iconId)) {
              tempLimits.set(iconId, tempLimits.get(iconId)! + 1);
            }

            if (
              this._iconLimits.has(iconId) &&
              tempLimits.has(iconId) &&
              this._iconLimits.get(iconId)! < tempLimits.get(iconId)!
            ) {
              const forbiddenIcons = new Array<number>();
              this._iconLimits.forEach((value, key) => {
                if (tempLimits.get(key)! >= value) {
                  forbiddenIcons.push(key);
                }
              });

              if (reel == 1) {
                forbiddenIcons.push(...this._init[0]);
              }

              if (reel == reelsCount - 1) {
                forbiddenIcons.push(...this._init[reelsCount - 2]);
              }

              const foundIcon = spinedReel.find(
                (icon) => icon <= 99 && !forbiddenIcons.includes(icon)
              );
              initTape[i] =
                foundIcon !== undefined ? foundIcon : spinedReel.find((icon) => icon <= 99);

              if (tempLimits.has(initTape[i])) {
                tempLimits.set(initTape[i], tempLimits.get(initTape[i])! + 1);
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
          if (limitedIcons?.has(icon)) {
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

    const response = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine.curResponse;
    if (response.viewReels) {
      for (let i = 0; i < this._init.length; i++) {
        for (
          let j = this._additionalLinesUp;
          j < this._init[i].length - this._additionalLinesBottom;
          j++
        ) {
          this._init[i][j] = response.viewReels[i][j - this._additionalLinesUp];
        }
      }
    }
    return this._init;
  }

  getInitialReelsForFakeResponse(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][] {
    const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    const gameConfig: AbstractGameConfig =
      this._container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    let spinnedReels = gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;

    if (gameStateMachine.curResponse?.isFreeSpins) {
      if (gameConfig.freeSpinConfig?.noWinReels?.length !== 0) {
        const fakeReels = gameStateMachine.curResponse?.isFreeSpins
          ? gameConfig.getFakeConfig(
              StringUtils.format('freeSpin_{0}', [gameStateMachine.curResponse.freeSpinsInfo!.name])
            ).noWinReels
          : null;
        spinnedReels = fakeReels;
      }
    }

    const additionalLinesCount = internalReelsConfig.additionalLines;
    const totalLinesCount = linesCount + additionalLinesCount;
    this._additionalLinesUp = internalReelsConfig.additionalUpLines;
    this._additionalLinesBottom = internalReelsConfig.additionalBottomLines;

    this._init = new Array(reelsCount);
    let limitedIcons: Map<number, number> | null = null;
    let tempLimits: Map<number, number> = new Map<number, number>();
    if (this._iconLimits) {
      limitedIcons = new Map<number, number>();
      this._iconLimits.forEach((value, key) => limitedIcons!.set(key, 0));
      tempLimits = new Map<number, number>();
      this._iconLimits.forEach((value, key) => tempLimits.set(key, 0));
    }
    for (let reel = 0; reel < reelsCount; ++reel) {
      const spinedReel = spinnedReels[reel];

      let initTape = new Array(totalLinesCount);
      let attempts = 0;
      while (++attempts < ResponseInitialReelsProvider.MaxReelGenerateAttempts) {
        const index =
          spinedReel.length - totalLinesCount <= 0
            ? 0
            : this._rnd.nextInt(spinedReel.length - totalLinesCount);
        if (spinedReel[index] > 99) {
          continue;
        }

        initTape = spinedReel.slice(index, index + totalLinesCount);

        if (this._iconLimits) {
          for (let i = 0; i < initTape.length; i++) {
            const iconId = initTape[i];
            if (tempLimits.has(iconId)) {
              tempLimits.set(iconId, tempLimits.get(iconId)! + 1);
            }

            if (
              this._iconLimits.has(iconId) &&
              tempLimits.has(iconId) &&
              this._iconLimits.get(iconId)! < tempLimits.get(iconId)!
            ) {
              const forbiddenIcons = new Array<number>();
              this._iconLimits.forEach((value, key) => {
                if (tempLimits.get(key)! >= value) {
                  forbiddenIcons.push(key);
                }
              });

              if (reel == 1) {
                forbiddenIcons.push(...this._init[0]);
              }

              if (reel == reelsCount - 1) {
                forbiddenIcons.push(...this._init[reelsCount - 2]);
              }

              const foundIcon = spinedReel.find(
                (icon) => icon <= 99 && !forbiddenIcons.includes(icon)
              );
              initTape[i] =
                foundIcon !== undefined ? foundIcon : spinedReel.find((icon) => icon <= 99);

              if (tempLimits.has(initTape[i])) {
                tempLimits.set(initTape[i], tempLimits.get(initTape[i])! + 1);
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
          if (limitedIcons?.has(icon)) {
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

  getSpinedReels(spinedReels: number[][]): number[][] {
    return spinedReels;
  }
}
