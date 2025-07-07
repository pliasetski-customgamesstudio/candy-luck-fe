import { IterateExecutor } from './iterate_executor';
import { NodeOperation, parseNodeOperationEnum } from '../../enums/node_operation';
import { IMessageContext } from '../i_message_context';
import { SceneObject, VideoSceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ExecuteHelper } from '../utils/execute_helper';
import { ConfigConstants } from '../../configuration/config_constants';

export class NodeExecutor extends IterateExecutor {
  private readonly _nodeOperation: NodeOperation;

  constructor(elementId: string, destinationElementId: string, nodeOperation: NodeOperation) {
    super({
      [ConfigConstants.elementId]: elementId,
      [ConfigConstants.destinationElementId]: destinationElementId,
    });
    this._nodeOperation = nodeOperation;
  }

  static fromJson(json: Record<string, any>): NodeExecutor {
    return new NodeExecutor(
      json.elementId,
      json.destinationElementId,
      json.nodeOperation ? parseNodeOperationEnum(json.nodeOperation) : NodeOperation.Relocate
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    _token: CancellationToken
  ): Promise<void> {
    const element = ExecuteHelper.GetElementFromList(roots, paramsList[ConfigConstants.elementId]);
    switch (this._nodeOperation) {
      case NodeOperation.Relocate:
        if (element?.parent) {
          element.parent.removeChild(element);
        }
        const destinationElement = ExecuteHelper.GetElementFromList(
          roots,
          paramsList[ConfigConstants.destinationElementId]
        );
        destinationElement?.addChild(element!);
        break;
      case NodeOperation.Remove:
        if (element?.parent) {
          element.parent.removeChild(element);
        }
        element?.deinitialize();
        break;
      case NodeOperation.RemoveAllChildren:
        element?.removeAllChilds();
        break;
      case NodeOperation.SyncVideoStart:
        const videos = element?.findAllByType(VideoSceneObject) || [];
        await Promise.all(videos.map((v) => v.prepareToPlay()));
        break;
      default:
        console.log(`Handling of nodeOperation: ${this._nodeOperation} is not implemented`);
        break;
    }
  }
}
