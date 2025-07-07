import { StringUtils } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { SlotSession } from '../../../common/slot_session';
import { AbstractIconStopbehaviorProvider } from '../../icon_stop_behaviors/abstract_icon_stop_behavior_provider';
import { IconStopbehaviorDescription } from '../../icon_stop_behaviors/icon_stop_behavior_description';
import { IconStopbehaviorPlacementSystem } from '../../icon_stop_behaviors/systems/icon_stop_behavior_placement_system';
import { IconStopbehaviorPortalSystem } from '../../icon_stop_behaviors/systems/icon_stop_behavior_portal_system';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AnticipationConfig } from '../../../../reels_engine/game_config/game_config';
import { ReelsEngine, ReelsEngineSystemUpdateOrders } from '../../../../reels_engine/reels_engine';
import {
  T_ISlotSessionProvider,
  T_ISlotGameEngineProvider,
  T_IGameConfigProvider,
} from '../../../../type_definitions';
import { Game112IconStopBehaviorRenderSystem } from './game112_icon_stop_behavior_render_system';
import { IGameConfigProvider } from '../../interfaces/i_game_config_provider';

export class Game112IconStopbehaviorProvider extends AbstractIconStopbehaviorProvider {
  reelsContainsAnticipation: Map<number, boolean[]> = new Map<number, boolean[]>();
  _iconIds: number[];
  _isStbAvailable: boolean = false;
  _anticipationConfig: AnticipationConfig;
  _reelEngine: ReelsEngine;
  get IsStbAvailable(): boolean {
    return this._isStbAvailable;
  }
  Path: string;
  _minIconsOnFs: number;
  _slotSession: SlotSession;
  _container: Container;

  constructor(
    container: Container,
    iconIds: number[],
    { path = 'icons/', minIconsOnFs = 2 }: { path?: string; minIconsOnFs?: number } = {}
  ) {
    super(container);
    this._minIconsOnFs = minIconsOnFs;
    this._iconIds = iconIds;
    this.Path = path;
    this._container = container;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._anticipationConfig = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider)
      .gameConfig.anticipationConfig as AnticipationConfig;
  }

  createSystems(): void {
    const portalSystem = new IconStopbehaviorPortalSystem(
      this.reelsEngine.entityEngine,
      this.reelsEngine.entityCacheHolder,
      this.reelsEngine.internalConfig
    ).withInitialize();
    portalSystem.updateOrder = ReelsEngineSystemUpdateOrders.portalSystemUpdateOrder - 1;
    portalSystem.register();

    const placementSystem = new IconStopbehaviorPlacementSystem(
      this.reelsEngine.entityEngine,
      this.reelsEngine.entityCacheHolder,
      this
    ).withInitialize();
    placementSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.symbolPlacementSystemUpdateOrder - 1;
    placementSystem.register();

    const sceneList = [
      StringUtils.format('icons/icon_{0}_stb', [1]),
      StringUtils.format('icons/icon_{0}_stb', [14]),
      StringUtils.format('icons/icon_{0}_stb', [15]),
    ];

    this.renderSystem = new Game112IconStopBehaviorRenderSystem(
      this.reelsEngine.entityEngine,
      this.reelsEngine.entityCacheHolder,
      this.iconNodeProvider.iconsRender,
      this.iconNodeProvider.animIconsRender,
      this.sceneCache,
      this,
      sceneList
    ).withInitialize() as Game112IconStopBehaviorRenderSystem;
    this.renderSystem.updateOrder = ReelsEngineSystemUpdateOrders.renderSystemUpdateOrder + 1;
    this.renderSystem.register();
  }

  isWinPossible(symbolId: number, reel: number): boolean {
    if (symbolId == 14 || symbolId == 15) return true;
    const response = this.gameStateMachine.curResponse;
    let symbolsCount = 0;
    for (let i = 0; i < reel; i++) {
      if (response.viewReels[i].includes(1)) {
        symbolsCount++;
      }
    }

    let minIconsForWin = this._anticipationConfig.minIconsForWin;
    if (
      response.specialSymbolGroups &&
      response.specialSymbolGroups.some((arg) => arg.type == 'ReTrigger')
    ) {
      minIconsForWin = 2;
    }
    const reelsLeft = this._anticipationConfig.anticipationReels[
      this._anticipationConfig.anticipationIcons.indexOf(symbolId)
    ].filter((r) => r >= reel).length;

    return reelsLeft >= minIconsForWin || minIconsForWin - symbolsCount <= reelsLeft;
  }

  createValues(): void {
    this._isStbAvailable = false;
    for (const id of this._iconIds) {
      this.reelsContainsAnticipation.set(
        id,
        new Array<boolean>(this._reelEngine.ReelConfig.reelCount).fill(false)
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
            let stateName = 'anticipation';

            const anticipationReels = this.reelsContainsAnticipation.get(viewReels[reel][line]);
            if (!anticipationReels || !anticipationReels[reel]) {
              const ar = this.reelsContainsAnticipation.get(viewReels[reel][line]) as boolean[];
              ar[reel] = true;
            } else {
              stateName = 'anticipation2';
            }
            this.valueDescriptions.set(
              position,
              new IconStopbehaviorDescription(
                StringUtils.format('{0}icon_{1}_stb', [this.Path, viewReels[reel][line]]),
                '',
                0.0,
                position,
                stateName
              )
            );
            this._isStbAvailable = true;
          }
        }
      }
    }
  }
}
