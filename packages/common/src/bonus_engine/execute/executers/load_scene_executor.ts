import { IterateExecutor } from './iterate_executor';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { SceneProviderComponent } from '../../components/scene_provider_component';
import { MessagingConstants } from '../../messaging/messaging_constants';
import { ExecuteHelper } from '../utils/execute_helper';
import { ConfigConstants } from '../../configuration/config_constants';

export class LoadSceneExecutor extends IterateExecutor {
  constructor(parentId: string, sceneName: string, elementId: string) {
    super({
      [ConfigConstants.parentId]: parentId,
      [ConfigConstants.sceneName]: sceneName,
      [ConfigConstants.elementId]: elementId,
    });
  }

  static fromJson(json: Record<string, any>): LoadSceneExecutor {
    return new LoadSceneExecutor(json.parentId, json.sceneName, json.elementId);
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    _token: CancellationToken
  ): Promise<void> {
    const sceneProvider = context.message?.getValue(
      MessagingConstants.sceneProvider
    ) as SceneProviderComponent;
    const parent = ExecuteHelper.GetElementFromList(roots, paramsList[ConfigConstants.parentId]);
    const scene = sceneProvider.getScene(paramsList[ConfigConstants.sceneName]);
    if (paramsList[ConfigConstants.elementId]) {
      scene.id = paramsList[ConfigConstants.elementId];
    }
    parent!.addChild(scene);
  }
}
