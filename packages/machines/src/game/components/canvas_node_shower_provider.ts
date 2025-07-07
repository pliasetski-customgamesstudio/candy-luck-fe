import { Container, Platform, T_Platform } from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { T_ResourcesComponent } from '../../type_definitions';

export class CanvasNodeShowerProvider {
  private _container: Container;
  private _nodeIds: string[];

  constructor(container: Container, nodeIds: string[]) {
    this._container = container;
    this._nodeIds = nodeIds;
    const platform = this._container.forceResolve<Platform>(T_Platform);
    if (platform.videoSystem.isWebGL) {
      const gameResourceProvider =
        this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
      for (const id of this._nodeIds) {
        gameResourceProvider.slot.findById(id)!.visible = false;
        gameResourceProvider.slot.findById(id)!.active = false;
      }
    }
  }
}
