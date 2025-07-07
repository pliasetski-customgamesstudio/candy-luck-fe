import { ReelsEngine } from 'machines';
import { ISlotGameEngine } from 'syd';
import { IconsSceneObjectComponent } from 'machines/src/icons_scene_object_component';
import { IconModelComponent } from 'machines/src/icon_model_component';
import { IconEnumeratorComponent } from 'machines/src/icon_enumerator_component';
import { IReelsConfigProvider } from 'machines/src/reels_config_provider';
import { IGameStateMachineProvider } from 'machines/src/game_state_machine_provider';
import { RegularSpinsSoundModelComponent } from 'machines/src/regular_spins_sound_model_component';

class FreeFallReelsEngineComponent implements IReelsEngineProvider, ISlotGameEngineProvider {
  private _reelsEngine: ReelsEngine;
  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  get gameEngine(): ISlotGameEngine {
    return this._reelsEngine;
  }

  constructor(container: Container, useSounds: boolean = true) {
    console.log('load ' + this.constructor.name);
    const iconsSceneObject: IconsSceneObjectComponent =
      container.forceResolve<IconsSceneObjectComponent>(T_IconsSceneObjectComponent).iconsRender;
    const animIconsSceneObject: IconsSceneObjectComponent =
      container.forceResolve<IconsSceneObjectComponent>(
        T_IconsSceneObjectComponent
      ).animIconsRender;
    const iconModel: IconModelComponent =
      container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    const enumerator: IconEnumeratorComponent =
      container.resolve(IconEnumeratorComponent).iconsEnumerator;
    const reelsConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;

    this._reelsEngine = new FreeFallReelsEngine(
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
  }
}
