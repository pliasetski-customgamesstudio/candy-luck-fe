import { Container } from '@cgs/syd';
import { EntitiesEngine } from '../../reels_engine/entities_engine/entities_engine';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotGameEngine } from '../../reels_engine/i_slot_game_engine';
import { IconEnumerator } from '../../reels_engine/icon_enumerator';
import { IconsSceneObject } from '../../reels_engine/icons_scene_object';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import {
  T_IconsSceneObjectComponent,
  T_IconModelComponent,
  T_IReelsConfigProvider,
  T_IGameStateMachineProvider,
  T_RegularSpinsSoundModelComponent,
  T_IconEnumeratorComponent,
} from '../../type_definitions';
import { IconEnumeratorComponent } from './icon_enumerator_component';
import { IconModel } from './icon_model';
import { IconModelComponent } from './icon_model_component';
import { IconsSceneObjectComponent } from './icons_scene_object_component';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';

export class ReelsEngineComponent implements IReelsEngineProvider, ISlotGameEngineProvider {
  private _reelsEngine: ReelsEngine;
  public get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  public get gameEngine(): ISlotGameEngine {
    return this._reelsEngine;
  }

  constructor(container: Container, useSounds: boolean = true) {
    console.log('load ' + this.constructor.name);
    const iconsSceneObject: IconsSceneObject = container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    ).iconsRender;
    const animIconsSceneObject: IconsSceneObject =
      container.forceResolve<IconsSceneObjectComponent>(
        T_IconsSceneObjectComponent
      ).animIconsRender;
    const iconModel: IconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    const enumerator: IconEnumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    const reelsConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;

    console.log('create reel engine');

    this._reelsEngine = new ReelsEngine(
      container,
      new EntitiesEngine(ComponentNames.Count),
      iconsSceneObject,
      animIconsSceneObject,
      iconModel,
      enumerator,
      reelsConfig,
      gameStateMachine,
      reelsSoundModel,
      useSounds
    );

    console.log('create reel engine after');
  }
}
