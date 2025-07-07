import { IterateExecutor } from './iterate_executor';
import { GestureType, parseGestureTypeEnum } from '../../enums/gesture_type';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { Button, Completer, SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ExecuteHelper } from '../utils/execute_helper';
import { OperationCancelledError } from '../../../future/operation_cancelled_error';

export class GestureExecutor extends IterateExecutor {
  private readonly _gestureType: GestureType;

  constructor(elementId: string, gestureType: GestureType) {
    super({
      [ConfigConstants.elementId]: elementId,
    });
    this._gestureType = gestureType;
  }

  static fromJson(json: any): GestureExecutor {
    return new GestureExecutor(
      json[ConfigConstants.elementId],
      parseGestureTypeEnum(json[ConfigConstants.targetGesture])
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    const waitForGesture: Completer<void>[] = [];
    const elements = ExecuteHelper.GetAllElementsFromList(
      roots,
      paramsList[ConfigConstants.elementId]
    );
    for (const element of elements) {
      const completer = new Completer<void>();
      if (this._gestureType === GestureType.Click && element instanceof Button) {
        element.clicked.first.then(() => {
          if (!token.isCancellationRequested) {
            if (!completer.isCompleted) {
              completer.complete();
            }
          } else {
            completer.completeError(new OperationCancelledError());
          }
        });
        waitForGesture.push(completer);
      }
    }
    await Promise.all(waitForGesture.map((c) => c.promise));
  }
}
