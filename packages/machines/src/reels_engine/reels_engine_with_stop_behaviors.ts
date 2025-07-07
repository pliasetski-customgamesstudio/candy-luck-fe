import { Container } from '@cgs/syd';
import { EntitiesEngine } from './entities_engine/entities_engine';
import { IIconModel } from './i_icon_model';
import { IReelsConfig } from './i_reels_config';
import { IconEnumerator } from './icon_enumerator';
import { IconsSceneObject } from './icons_scene_object';
import { ReelsEngine } from './reels_engine';
import { ReelsSoundModel } from './reels_sound_model';
import { RenderSystemWithStopbehaviors } from './render_system_with_stop_behaviors';
import { GameStateMachine } from './state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';

export class ReelsEngineWithStopbehaviors extends ReelsEngine {
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
    componentsCount?: number
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
      null,
      '',
      componentsCount
    );
  }

  createSystems(): void {
    super.createSystems();
    this.renderSystem.unregister();
    this.renderSystem = new RenderSystemWithStopbehaviors(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconModel,
      this.iconRender,
      this.animIconRender,
      this.iconDrawOrderCalculator
    );
    this.renderSystem.register();
  }
}
