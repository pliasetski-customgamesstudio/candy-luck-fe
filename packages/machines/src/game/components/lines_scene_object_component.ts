import { LinesSceneObject } from '../../reels_engine/lines_scene_object';
import { Container, IResourceCache, TextureResource } from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { T_IGameStateMachineProvider, T_ResourcesComponent } from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';

export class LinesSceneObjectComponent {
  linesSceneObject: LinesSceneObject;
  constructor(container: Container, resourceCache: IResourceCache) {
    console.log('load ' + this.constructor.name);
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const textureResource = resourceCache.getResource<TextureResource>(
      TextureResource.TypeId,
      'line.png'
    );
    this.linesSceneObject = new LinesSceneObject();
    this.linesSceneObject.texture = textureResource!.data!;
    const linesHolder = res.slot.findById('lines_holder');
    linesHolder?.addChild(this.linesSceneObject);

    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    gameStateMachine.accelerate.entered.listen(() => this.linesSceneObject.clear());
  }
}
