import { IExecuteData } from './i_execute_data';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';

export class EmptyExecute implements IExecuteData {
  static readonly MessagePropertyValue: string = 'EmptyExecute.Delay';

  static fromJson(json: Record<string, any>): EmptyExecute {
    return new EmptyExecute(json[ConfigConstants.duration]);
  }

  private readonly _duration: number;

  constructor(duration: number) {
    this._duration = duration;
  }

  async play(
    context: IMessageContext,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    console.log(`${new Date()}: Empty executor with duration ${this._duration} completed`);
    await new Promise((resolve) => setTimeout(resolve, this._duration));
    token.throwIfCancellationRequested();
    const delay = context.message?.getValue(EmptyExecute.MessagePropertyValue);
    if (typeof delay === 'number') {
      context.message?.setValue(EmptyExecute.MessagePropertyValue, this._duration + delay);
    } else {
      context.message?.setValue(EmptyExecute.MessagePropertyValue, this._duration);
    }
  }
}
