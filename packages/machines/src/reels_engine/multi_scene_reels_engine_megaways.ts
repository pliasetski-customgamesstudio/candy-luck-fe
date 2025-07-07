import { StringUtils } from '@cgs/shared';
import { Container, Vector2, IntervalAction } from '@cgs/syd';
import {
  T_IReelsConfigProvider,
  T_IGameConfigProvider,
  T_AbstractIconResourceProvider,
} from '../type_definitions';
import { ComponentIndex } from './entities_engine/component_index';
import { EntitiesEngine } from './entities_engine/entities_engine';
import { Entity } from './entities_engine/entity';
import { ComponentNames } from './entity_components/component_names';
import { IIconModel } from './i_icon_model';
import { IReelsConfig } from './i_reels_config';
import { IconEnumerator } from './icon_enumerator';
import { IconsSceneObject } from './icons_scene_object';
import { InternalReelsConfigMegaways } from './internal_reels_config_megaways';
import { MultiSceneReelsEngineV2 } from './multi_scene_reels_engine_v2';
import { ReelsSoundModel } from './reels_sound_model';
import { GameStateMachine } from './state_machine/game_state_machine';
import { AbstractIconResourceProvider } from '../game/components/abstract_icon_resource_provider';
import { ISpinResponse } from '@cgs/common';
import { ListSet } from './utils/list_set';
import { MultiSceneIconResourceProvider } from '../game/components/multi_scene_icon_resource_provider';
import { IReelsConfigProvider } from '../game/components/interfaces/i_reels_config_provider';
import { MegawaysReelsConfigComponent } from '../game/components/megaways_reels_config_component';
import { IGameConfigProvider } from '../game/components/interfaces/i_game_config_provider';
import { IconModel } from '../game/components/icon_model';

export class MultiSceneReelsEngineMegaways extends MultiSceneReelsEngineV2 {
  private _drawIndex: ComponentIndex;

  get iconResourceProvider(): MultiSceneIconResourceProvider {
    if (!this._iconResourceProvider) {
      this._iconResourceProvider = this.container.forceResolve<AbstractIconResourceProvider>(
        T_AbstractIconResourceProvider
      ) as MultiSceneIconResourceProvider;
    }

    return this._iconResourceProvider;
  }

  constructor(
    container: Container,
    entityEngine: EntitiesEngine,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconModel: IIconModel,
    iconsEnumerator: IconEnumerator,
    ReelConfig: IReelsConfig,
    gameStateMachine: GameStateMachine<ISpinResponse>,
    reelsSoundModel: ReelsSoundModel,
    useSounds: boolean,
    animatedIcons?: number[],
    animName?: string,
    componentsCount?: number,
    iconLimits?: Map<number, number>
  ) {
    super(
      container,
      entityEngine,
      iconRender,
      animIconRender,
      iconModel,
      iconsEnumerator,
      ReelConfig,
      gameStateMachine,
      reelsSoundModel,
      useSounds,
      animatedIcons,
      animName,
      componentsCount,
      iconLimits
    );
    this._iconNodeIndex = entityEngine.getComponentIndex(ComponentNames.IconNode);
    this._drawIndex = entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
  }

  protected _createInternalConfig(config: IReelsConfig): InternalReelsConfigMegaways {
    return new InternalReelsConfigMegaways(config);
  }

  public updateReelsConfigInMegaways(
    config: IReelsConfig,
    linesInReel: number[],
    ignoredFilters: string[]
  ): void {
    const filter = this.entityEngine.getFilterByIndex([
      this.entityEngine.getComponentIndex(ComponentNames.Position),
    ]);
    const entities = this.entityEngine
      .getEntities(filter)
      .list.filter((e) =>
        ignoredFilters.some((f) => !e.hasComponent(this.entityEngine.getComponentIndex(f)))
      );
    for (const entity of entities) {
      let position = entity.get(
        this.entityEngine.getComponentIndex(ComponentNames.Position)
      ) as Vector2;
      const reel = entity.get(
        this.entityEngine.getComponentIndex(ComponentNames.ReelIndex)
      ) as number;
      const ss = this.ReelConfig.symbolSizeByReel as Vector2[];
      if (Math.abs(Math.round(this.ReelConfig.slotSize.y / ss[reel].y) - linesInReel[reel]) != 0.0)
        position = new Vector2(
          position.x,
          (position.y * Math.round(this.ReelConfig.slotSize.y / ss[reel].y)) / linesInReel[reel]
        );
      entity.set(this.entityEngine.getComponentIndex(ComponentNames.Position), position);
    }
    this.ReelConfig = config;
    this.internalConfig = new InternalReelsConfigMegaways(this.ReelConfig);
    this.beforeBrakingSystem.updateConfig(this.internalConfig);
    this.portalSystem.updateConfig(this.internalConfig);
    this.checkIconSystem.updateConfig(this.internalConfig);
  }

  public createEntities(): void {
    const gameConfig = this.container.forceResolve<IReelsConfigProvider>(
      T_IReelsConfigProvider
    ) as MegawaysReelsConfigComponent;
    const linesInReel: number[] = new Array<number>(this.ReelConfig.reelCount);
    for (let i = 0; i < this.ReelConfig.reelCount; i++) {
      linesInReel[i] = this._random.nextInt(4) + 3; //// lines count
    }
    gameConfig.updateConfig(linesInReel);

    const config =
      this.container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;

    let maxPosition = this.internalConfig.lineCount * this.internalConfig.reelCount;
    if (
      config &&
      config.staticConfig &&
      config.staticConfig.spinedReels &&
      config.staticConfig.spinedReels.length > 0
    ) {
      let maxLength = 0;
      for (const spinnedReels of config.staticConfig.spinedReels) {
        if (spinnedReels.length > maxLength) {
          maxLength = spinnedReels.length;
        }
      }
      maxPosition = Math.max(
        maxLength - 1,
        this.internalConfig.lineCount * this.internalConfig.reelCount
      );
    }
    const randomPosition = this._random.nextInt(maxPosition) + this.internalConfig.lineCount;
    const iconModel = super.iconModel as IconModel;
    for (let i = iconModel.minStaticIconId; i <= iconModel.maxStaticIconId; i++) {
      if (this.iconLimits && this.iconLimits.has(i)) {
        const newIconLimit = this.iconLimits.get(i) as number;
        this._iconResourceProvider.checkAndCreate(
          StringUtils.format('icon_{0}', [i]),
          newIconLimit
        );
      } else {
        this._iconResourceProvider.checkAndCreate(StringUtils.format('icon_{0}', [i]), 30);
      }
    }

    for (let reel = 0; reel < this.internalConfig.reelCount; ++reel) {
      const offset = this.internalConfig.reelsOffset[reel];
      const fakeConfigByReel = config.getFakeConfig(
        'staticConfig' + linesInReel[reel].toString()
      ).noWinReels;
      for (let lineIndex = 0; lineIndex < this.internalConfig.lineCount; ++lineIndex) {
        const symbol = new Entity(this.entityEngine);
        const lineIndexPos = lineIndex - this.internalConfig.additionalUpLines;

        symbol.addComponent(
          ComponentNames.Position,
          new Vector2(
            Math.ceil(reel * this.internalConfig.symbolSizeByReel[reel].x + offset.x),
            lineIndexPos * this.internalConfig.symbolSizeByReel[reel].y + offset.y
          )
        );

        const enumerationIndex = randomPosition - lineIndex - 1;
        const tape = this.iconsEnumerator.getInitial(reel, lineIndex);

        const iconScenes = this._iconResourceProvider.getIconNodes(
          StringUtils.format('icon_{0}', [tape])
        );

        this.iconsEnumerator.setInitialReels(fakeConfigByReel);
        const iconScene = iconScenes ? iconScenes[0] : null;

        symbol.addComponent(ComponentNames.IconNode, iconScene);
        symbol.addComponent(ComponentNames.DrawableIndex, tape);
        symbol.addComponent(ComponentNames.ReelIndex, reel);
        symbol.addComponent(ComponentNames.LineIndex, lineIndexPos);
        symbol.addComponent(ComponentNames.EnumerationIndex, enumerationIndex);
        symbol.addComponent(ComponentNames.Visible, true);
        symbol.addComponent(ComponentNames.SingleSpinningIndex, false);
        symbol.register();
        this.entityCacheHolder.addEntities(reel, lineIndexPos, false, [symbol]);
      }
    }
    const animationEntity = new Entity(this.entityEngine);

    animationEntity.addComponent(ComponentNames.ProcessAnimation, new ListSet<IntervalAction>());
    animationEntity.register();
    this.updateReelsConfigInMegaways(gameConfig.reelsConfig, linesInReel, [
      'StikyMovingWildMarker',
    ]);
  }
}
