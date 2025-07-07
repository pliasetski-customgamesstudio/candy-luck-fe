import { ISpinResponse, ISlotMachineInfo } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import { InitialReelsComponent } from './initial_reels_component';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { InternalReelsConfig } from '../../../reels_engine/internal_reels_config';
import {
  T_IGameConfigProvider,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_StartGameResponseProvider,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { StartGameResponseProvider } from '../../start_game_response_provider';

export class ResponseInitialReelsComponent extends InitialReelsComponent {
  private _additionalLinesUp: number;
  private _additionalLinesBottom: number;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container, iconLimits: Map<number, number> | null = null) {
    super(container, iconLimits);
  }

  public getInitialReels(
    reelsCount: number,
    linesCount: number,
    internalReelsConfig: InternalReelsConfig
  ): number[][] {
    this._additionalLinesUp = internalReelsConfig.additionalUpLines;
    this._additionalLinesBottom = internalReelsConfig.additionalBottomLines;
    const gameConfig =
      this.container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
    if (!this._gameStateMachine) {
      this._gameStateMachine = this.container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
    }
    let spinnedReels = gameConfig.staticConfig.noWinReels ?? gameConfig.staticConfig.spinedReels;
    if (this._gameStateMachine.curResponse && this._gameStateMachine.curResponse.isFreeSpins) {
      if (
        gameConfig.freeSpinConfig &&
        gameConfig.freeSpinConfig.noWinReels &&
        gameConfig.freeSpinConfig.noWinReels.length !== 0
      ) {
        spinnedReels = gameConfig.freeSpinConfig.noWinReels;
      }
    } else {
      const session =
        this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
      const info: ISlotMachineInfo = session.machineInfo;
      if (info.spinResult && info.spinResult.isFreeSpins) {
        if (
          gameConfig.freeSpinConfig &&
          gameConfig.freeSpinConfig.noWinReels &&
          gameConfig.freeSpinConfig.noWinReels.length !== 0
        ) {
          spinnedReels = gameConfig.freeSpinConfig.noWinReels;
        }
      }
    }

    const init: number[][] = new Array(reelsCount);
    let limitedIcons: Map<number, number> | null = null;
    let tempLimits: Map<number, number> | null = null;
    if (this.iconLimits) {
      limitedIcons = new Map<number, number>();
      this.iconLimits.forEach((value, key) => limitedIcons!.set(key, 0));
      tempLimits = new Map<number, number>();
      this.iconLimits.forEach((value, key) => tempLimits!.set(key, 0));
    }
    if (!tempLimits) {
      tempLimits = new Map<number, number>();
    }

    for (let reel = 0; reel < reelsCount; ++reel) {
      const spinedReel = spinnedReels[reel];

      let initTape: (number | null)[] = new Array(linesCount);
      let attempts = 0;
      while (++attempts < ResponseInitialReelsComponent.MaxReelGenerateAttempts) {
        const index =
          spinedReel.length - linesCount <= 0
            ? 0
            : this.random.nextInt(spinedReel.length - linesCount);
        if (spinedReel[index] > 99) {
          continue;
        }

        initTape = spinedReel.slice(index, index + linesCount);

        if (this.iconLimits) {
          for (let i = 0; i < initTape.length; i++) {
            const iconId = initTape[i];
            if (tempLimits.has(iconId!)) {
              tempLimits.set(iconId!, tempLimits.get(iconId!)! + 1);
            }

            if (
              this.iconLimits.has(iconId!) &&
              tempLimits.has(iconId!) &&
              this.iconLimits.get(iconId!)! < tempLimits.get(iconId!)!
            ) {
              const forbiddenIcons: number[] = [];
              this.iconLimits.forEach((value, key) => {
                if (tempLimits!.get(key)! >= value) {
                  forbiddenIcons.push(key);
                }
              });

              if (reel === 1) {
                forbiddenIcons.push(...init[0]);
              }

              if (reel === reelsCount - 1) {
                forbiddenIcons.push(...init[reelsCount - 2]);
              }

              initTape[i] =
                spinedReel.find((icon) => icon <= 99 && !forbiddenIcons.includes(icon)) || null;
              if (typeof initTape[i] !== 'number') {
                initTape[i] = spinedReel.find((icon) => icon <= 99)!;
              }

              if (tempLimits.has(initTape[i]!)) {
                tempLimits.set(initTape[i]!, tempLimits.get(initTape[i]!)! + 1);
              }
            }
          }
        }

        const initTapeDivided = initTape.map((iconId) =>
          iconId! > 100 ? Math.floor(iconId! / 100) : iconId
        );
        if (
          (reel === 1 &&
            init[0]
              .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
              .filter((iconId) => initTapeDivided.includes(iconId)).length > 0) ||
          (reel === reelsCount - 1 &&
            init[reelsCount - 2]
              .map((iconId) => (iconId > 100 ? Math.floor(iconId / 100) : iconId))
              .filter((iconId) => initTapeDivided.includes(iconId)).length > 0)
        ) {
          continue;
        }

        for (const icon of initTape) {
          if (limitedIcons && limitedIcons.has(icon!)) {
            limitedIcons.set(icon!, limitedIcons.get(icon!)! + 1);
          }
        }
        break;
      }

      init[reel] = initTape.slice() as number[];
    }

    const response = this.container.forceResolve<StartGameResponseProvider>(
      T_StartGameResponseProvider
    ).startMachineInfo.spinResult;
    if (response && response.viewReels) {
      for (let i = 0; i < init.length; i++) {
        for (
          let j = this._additionalLinesUp;
          j < init[i].length - this._additionalLinesBottom;
          j++
        ) {
          init[i][j] = response.viewReels[i][j - this._additionalLinesUp];
        }
      }
    }

    return init;
  }
}
