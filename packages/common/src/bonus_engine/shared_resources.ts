import { IResourceManager } from './resources/i_resource_manager';
import { SceneObject } from '@cgs/syd';
import { ResourcesConfiguration } from './configuration/elements/resources_configuration';

export class SharedResources {
  private readonly _resourceManager: IResourceManager;
  private readonly _parent: SceneObject;
  private readonly _configurations: ResourcesConfiguration[];
  private _resourceScenes: SceneObject[];

  constructor(
    parent: SceneObject,
    configurations: ResourcesConfiguration[],
    resourceManager: IResourceManager
  ) {
    this._parent = parent;
    this._configurations = configurations;
    this._resourceManager = resourceManager;
  }

  get resourceScenes(): SceneObject[] {
    return this._resourceScenes;
  }

  load(): void {
    this._resourceScenes = [];
    for (const config of this._configurations) {
      const scene = this._resourceManager.getScene(config.sceneName);
      this._parent.addChild(scene);
      this._resourceScenes.push(scene);
    }
  }

  unload(): void {
    for (let i = 0; i < this._configurations.length && i < this._resourceScenes.length; i++) {
      const config = this._configurations[i];
      const scene = this._resourceScenes[i];
      this._parent.removeChild(scene);
      this._resourceManager.clear(config.sceneName);
    }
    this._resourceScenes = [];
  }
}
