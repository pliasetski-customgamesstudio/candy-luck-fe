import { IterateExecutor } from './iterate_executor';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ConfigConstants } from '../../configuration/config_constants';

export class ComponentExecutor extends IterateExecutor {
  public static fromJson(json: Record<string, any>): IterateExecutor {
    return new ComponentExecutor(json);
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    _roots: SceneObject[],
    _token: CancellationToken
  ): Promise<void> {
    const component = context.message?.getValue(paramsList[ConfigConstants.targetComponentName]);
    component?.execute(paramsList[ConfigConstants.componentMethod], context, paramsList);
  }
}
