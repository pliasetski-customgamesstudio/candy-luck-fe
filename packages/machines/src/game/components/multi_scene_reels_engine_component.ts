import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ISlotGameEngine } from '../../reels_engine/i_slot_game_engine';
import { Container } from '@cgs/syd';
import {
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_IconEnumeratorComponent,
  T_IconModelComponent,
  T_IconsSceneObjectComponent,
  T_RegularSpinsSoundModelComponent,
} from '../../type_definitions';
import { IconsSceneObjectComponent } from './icons_scene_object_component';
import { IconModelComponent } from './icon_model_component';
import { IconEnumeratorComponent } from './icon_enumerator_component';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { MultiSceneReelsEngine } from '../../reels_engine/multi_scene_reels_engine';
import { EntitiesEngine } from '../../reels_engine/entities_engine/entities_engine';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';

export class MultiSceneReelsEngineComponent
  implements IReelsEngineProvider, ISlotGameEngineProvider
{
  private _reelsEngine: ReelsEngine;
  public get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  public get gameEngine(): ISlotGameEngine {
    return this._reelsEngine;
  }

  constructor(
    container: Container,
    useSounds: boolean = true,
    animatedIcons?: number[],
    animName: string = '',
    iconLimits?: Map<number, number>
  ) {
    console.log('load ' + this.constructor.name);
    const iconsSceneObject = container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    ).iconsRender;
    const animIconsSceneObject = container.forceResolve<IconsSceneObjectComponent>(
      T_IconsSceneObjectComponent
    ).animIconsRender;
    const iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    const enumerator =
      container.forceResolve<IconEnumeratorComponent>(T_IconEnumeratorComponent).iconsEnumerator;
    const reelsConfig = container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;

    this._reelsEngine = new MultiSceneReelsEngine(
      container,
      new EntitiesEngine(ComponentNames.Count),
      iconsSceneObject,
      animIconsSceneObject,
      iconModel,
      enumerator,
      reelsConfig,
      gameStateMachine,
      reelsSoundModel,
      useSounds,
      animatedIcons,
      animName,
      undefined,
      iconLimits
    );
  }
}
