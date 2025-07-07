import { StringUtils } from '@cgs/shared';
import { Container, EmptyAction } from '@cgs/syd';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AnticipationConfig } from '../../reels_engine/game_config/game_config';
import { ReelsEngine, ReelsEngineSystemUpdateOrders } from '../../reels_engine/reels_engine';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { T_ISlotGameEngineProvider, T_IGameConfigProvider } from '../../type_definitions';
import { CustomIconWithValuesRenderSystem } from './custom_icon_with_values_render_system';
import { AbstractIconWithValuesProvider } from './icon_with_values/abstract_icon_with_values_provider';
import { IconValueDescription } from './icon_with_values/icon_value_description';
import { IconWithValuesPlacementSystem } from './icon_with_values/systems/icon_with_values_placement_system';
import { IconWithValuesPortalSystem } from './icon_with_values/systems/icon_with_values_portal_system';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';

export class HiddenIconStopbehaviorComponent extends AbstractIconWithValuesProvider {
  private _container: Container;
  protected reelsContainsAnticipation: Map<number, boolean[]> = new Map<number, boolean[]>();
  private _iconIds: number[];
  private _isStbAvailable: boolean = false;
  private _anticipationConfig: AnticipationConfig;
  private ReelEngine: ReelsEngine;
  private _path: string;
  private _minIconsOnFs: number;

  constructor(
    container: Container,
    iconIds: number[],
    path: string = 'icons/',
    stopDelay: number = 0.6,
    minIconsOnFs: number = 2
  ) {
    super(container);
    this._container = container;
    this._iconIds = iconIds;
    this._path = path;
    this._minIconsOnFs = minIconsOnFs;
    this.ReelEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._anticipationConfig = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider)
      .gameConfig.anticipationConfig as AnticipationConfig;

    this.gameStateMachine.stop.addLazyAnimationToBegin(() => {
      if (this.isStbAvailable) {
        return new EmptyAction().withDuration(stopDelay);
      } else {
        return new EmptyAction();
      }
    });
  }

  get isStbAvailable(): boolean {
    return this._isStbAvailable;
  }

  get minIconsForWin(): number {
    return this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.event !=
        FreeSpinsInfoConstants.FreeSpinsStarted
      ? this._minIconsOnFs
      : this._anticipationConfig.minIconsForWin;
  }

  isWinPossible(symbolId: number, reel: number): boolean {
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

  createSystems(): void {
    const portalSystem = new IconWithValuesPortalSystem(
      this.reelsEngine.entityEngine,
      this.reelsEngine.entityCacheHolder,
      this.reelsEngine.internalConfig
    ).withInitialize();
    portalSystem.updateOrder = ReelsEngineSystemUpdateOrders.portalSystemUpdateOrder - 1;
    portalSystem.register();

    const placementSystem = new IconWithValuesPlacementSystem(
      this.reelsEngine.entityEngine,
      this.reelsEngine.entityCacheHolder,
      this
    ).withInitialize();
    placementSystem.updateOrder =
      ReelsEngineSystemUpdateOrders.symbolPlacementSystemUpdateOrder - 1;
    placementSystem.register();

    this.renderSystem = new CustomIconWithValuesRenderSystem(
      this.reelsEngine.entityEngine,
      this.reelsEngine.entityCacheHolder,
      this.iconNodeProvider.iconsRender,
      this.iconNodeProvider.animIconsRender,
      this.sceneCache,
      this
    ).withInitialize() as CustomIconWithValuesRenderSystem;
    this.renderSystem.updateOrder = ReelsEngineSystemUpdateOrders.renderSystemUpdateOrder + 1;
    this.renderSystem.register();
  }

  createValues(): void {
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
            if (!this.reelsContainsAnticipation.get(viewReels[reel][line])![reel]) {
              this.valueDescriptions.set(
                position,
                new IconValueDescription(
                  StringUtils.format('{0}icon_{1}_stb', [this._path, viewReels[reel][line]]),
                  '',
                  0.0,
                  position,
                  'anticipation'
                )
              );
              this.reelsContainsAnticipation.get(viewReels[reel][line])![reel] = true;
              this._isStbAvailable = true;
            } else {
              this.valueDescriptions.set(
                position,
                new IconValueDescription(
                  StringUtils.format('{0}icon_{0}_stb', [this._path, viewReels[reel][line]]),
                  '',
                  0.0,
                  position,
                  'anticipation2'
                )
              );
              this._isStbAvailable = true;
            }
          }
        }
      }
    }
  }
}
