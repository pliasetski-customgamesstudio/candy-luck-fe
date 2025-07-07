import { RoundComponentBase } from './round_component_base';
import { SceneObject } from '@cgs/syd';
import { IResourceManager } from '../resources/i_resource_manager';
import { ComponentConfiguration } from '../configuration/elements/component_configuration';
import { RoundMessage } from '../messaging/round_message';
import { MessagingConstants } from '../messaging/messaging_constants';

export class SceneProviderComponent extends RoundComponentBase {
  private _loadedScenes: SceneObject[] = [];
  private _resourceManager: IResourceManager;

  constructor(
    resourceManager: IResourceManager,
    source: SceneObject[],
    configuration: ComponentConfiguration
  ) {
    super(source, configuration.name);
    this._resourceManager = resourceManager;
  }

  deinit(): void {
    for (const scene of this._loadedScenes) {
      if (scene.parent) {
        scene.parent.removeChild(scene);
      }
      scene.deinitialize();
    }
  }

  init(): void {}

  proceedMessage(message: RoundMessage): void {
    super.proceedMessage(message);
    message.setValue(MessagingConstants.sceneProvider, this);
  }

  getScene(sceneName: string): SceneObject {
    const scene = this._resourceManager.getScene(sceneName, false);
    this._loadedScenes.push(scene);
    return scene;
  }
}
