import { SceneObject, Vector2, Container } from '@cgs/syd';
import { T_ResourcesComponent } from '../../type_definitions';
import { ResourcesComponent } from './resources_component';

export class ScaleDependencyProvider {
  private _machineScaleNode: SceneObject;

  get currentMachineScale(): Vector2 {
    return this._machineScaleNode ? this._machineScaleNode.scale : new Vector2(1.0, 1.0);
  }

  constructor(container: Container, machineScaleNodeId: string) {
    this._machineScaleNode = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.findById(machineScaleNodeId)!;
  }
}
