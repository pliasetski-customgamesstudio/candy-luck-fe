import { Container } from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { AnticipationConfig } from '../../reels_engine/game_config/game_config';
import { AbstractIconWithValuesProvider } from './icon_with_values/abstract_icon_with_values_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';
import { T_IGameConfigProvider, T_ISlotGameEngineProvider } from '../../type_definitions';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { IconValueDescription } from './icon_with_values/icon_value_description';
import { StringUtils } from '@cgs/shared';

export class IconStopbehaviorComponent extends AbstractIconWithValuesProvider {
  public reelsContainsAnticipation: Map<number, boolean[]> = new Map();

  private readonly _container: Container;
  private readonly _iconIds: number[];
  private readonly _anticipationConfig: AnticipationConfig;
  private readonly ReelEngine: ReelsEngine;
  private _isStbAvailable: boolean = false;

  constructor(container: Container, iconIds: number[]) {
    super(container);
    this._container = container;
    this._iconIds = iconIds;
    this.ReelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._anticipationConfig = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider)
      .gameConfig.anticipationConfig as AnticipationConfig;
  }

  public get container(): Container {
    return this._container;
  }

  public get iconIds(): number[] {
    return this._iconIds;
  }

  public get IsStbAvailable(): boolean {
    return this._isStbAvailable;
  }

  public get anticipationConfig(): AnticipationConfig {
    return this._anticipationConfig;
  }

  public get minIconsForWin(): number {
    return this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo?.event !==
        FreeSpinsInfoConstants.FreeSpinsStarted
      ? 2
      : this._anticipationConfig.minIconsForWin;
  }

  public isWinPossible(symbolId: number, reel: number): boolean {
    const reelsLeft = this._anticipationConfig.anticipationReels[
      this._anticipationConfig.anticipationIcons.indexOf(symbolId)
    ].filter((r) => r >= reel).length;
    const response = this.gameStateMachine.curResponse;
    let symbolsCount = 0;
    for (let i = 0; i < reel; i++) {
      if (response.viewReels[i].includes(symbolId)) {
        symbolsCount++;
      }
    }
    return reelsLeft >= this.minIconsForWin || this.minIconsForWin - symbolsCount <= reelsLeft;
  }

  public createValues(): void {
    this._isStbAvailable = false;
    for (const id of this._iconIds) {
      this.reelsContainsAnticipation.set(
        id,
        new Array<boolean>(this.ReelEngine.ReelConfig.reelCount).fill(false)
      );
    }
    const viewReels = this.gameStateMachine.curResponse.viewReels;
    const config = (
      this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
        .gameEngine as ReelsEngine
    ).internalConfig;
    for (let reel = 0; reel < viewReels.length; reel++) {
      for (let line = 0; line < viewReels[reel].length; line++) {
        if (this._iconIds.includes(viewReels[reel][line])) {
          if (this.isWinPossible(viewReels[reel][line], reel)) {
            const position = reel + line * config.reelCount;
            if (!this.reelsContainsAnticipation.get(viewReels[reel][line])?.[reel]) {
              this.valueDescriptions.set(
                position,
                new IconValueDescription(
                  StringUtils.format(`icons/icon_${viewReels[reel][line]}_stb`, []),
                  '',
                  0.0,
                  position,
                  'anticipation'
                )
              );
              if (!this.reelsContainsAnticipation.get(viewReels[reel][line])) {
                this.reelsContainsAnticipation.set(viewReels[reel][line], []);
              }
              this.reelsContainsAnticipation.get(viewReels[reel][line])![reel] = true;
            } else {
              this.valueDescriptions.set(
                position,
                new IconValueDescription(
                  StringUtils.format(`icons/icon_${viewReels[reel][line]}_stb`, []),
                  '',
                  0.0,
                  position,
                  'anticipation2'
                )
              );
            }
          }
        }
      }
    }
  }
}
