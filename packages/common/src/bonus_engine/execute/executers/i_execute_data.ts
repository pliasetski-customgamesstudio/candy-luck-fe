import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';

export interface IExecuteData {
  play(context: IMessageContext, roots: SceneObject[], token: CancellationToken): Promise<void>;
}
