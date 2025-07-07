import { IterateExecutor } from './iterate_executor';
import { IMessageContext } from '../i_message_context';
import { CgsEvent, Completer, ParamEvent, SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ConfigConstants } from '../../configuration/config_constants';
import { OperationCancelledError } from '../../../future/operation_cancelled_error';
import { ExecuteHelper } from '../utils/execute_helper';

export class StateExecutor extends IterateExecutor {
  constructor(
    elementId: string,
    stateId: string,
    listenerId: string,
    targetEvent: string,
    targetStateId: string,
    conditionNotInState: string
  ) {
    super({
      [ConfigConstants.elementId]: elementId,
      [ConfigConstants.stateId]: stateId,
      [ConfigConstants.listenerId]: listenerId,
      [ConfigConstants.targetEvent]: targetEvent,
      [ConfigConstants.targetStateId]: targetStateId,
      [ConfigConstants.conditionNotInState]: conditionNotInState,
    });
  }

  static fromJson(json: Record<string, any>): StateExecutor {
    return new StateExecutor(
      json[ConfigConstants.elementId],
      json[ConfigConstants.stateId],
      json[ConfigConstants.listenerId],
      json[ConfigConstants.targetEvent],
      json[ConfigConstants.targetStateId],
      json[ConfigConstants.conditionNotInState]
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    const executeTask = new Completer<void>();
    const cancellationSubscription = token.register(() => {
      cancellationSubscription.cancel();
      executeTask.completeError(new OperationCancelledError());
    });
    const complete = () => {
      cancellationSubscription.cancel();
      executeTask.complete();
    };
    const element = ExecuteHelper.GetElementFromList(roots, paramsList[ConfigConstants.elementId]);
    if (paramsList[ConfigConstants.listenerId]) {
      const listener = ExecuteHelper.GetElementFromList(
        roots,
        paramsList[ConfigConstants.listenerId]
      );
      const targetEvent = paramsList[ConfigConstants.targetEvent] || null;

      const streamSub = listener?.eventReceived.listen((s?: CgsEvent) => {
        if (s instanceof ParamEvent) {
          console.log(`${Date.now()}: Listened event: ${s.param}`);
          if (!targetEvent) {
            streamSub?.cancel();
            complete();
          } else {
            if (targetEvent === s.param) {
              streamSub?.cancel();
              complete();
            }
          }
        }
      });
    } else if (paramsList[ConfigConstants.targetStateId]) {
      const targetStateId = paramsList[ConfigConstants.targetStateId];
      if (element?.stateMachine!.isActive(targetStateId)) {
        complete();
        console.log(`${Date.now()}: Target state ${targetStateId} is already entered`);
      } else {
        const targetState = element?.stateMachine!.findById(targetStateId);
        const streamSub = targetState?.entered.listen(() => {
          streamSub?.cancel();
          complete();
          console.log(`${Date.now()}: Target state ${targetState.name} is entered`);
        });
      }
    } else if (paramsList[ConfigConstants.duration]) {
      const _duration = ExecuteHelper.tryParse(paramsList[ConfigConstants.duration].toString());
      if (!isNaN(_duration)) {
        await new Promise((resolve) => setTimeout(resolve, _duration));
        complete();
      }
    } else {
      complete();
    }

    if (paramsList[ConfigConstants.stateId] && paramsList[ConfigConstants.conditionNotInState]) {
      if (!element?.stateMachine!.isActive(paramsList[ConfigConstants.conditionNotInState])) {
        element?.stateMachine!.switchToState(paramsList[ConfigConstants.stateId]);
      }
    } else if (paramsList[ConfigConstants.stateId]) {
      element?.stateMachine!.switchToState(paramsList[ConfigConstants.stateId]);
    }
    return executeTask.promise;
  }
}
