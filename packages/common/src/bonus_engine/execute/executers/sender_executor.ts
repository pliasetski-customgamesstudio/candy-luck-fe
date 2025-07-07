import { IterateExecutor } from './iterate_executor';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { SenderComponent } from '../../components/sender_component';
import { ExecuteHelper } from '../utils/execute_helper';

export class SenderExecutor extends IterateExecutor {
  constructor(
    private executeSend: string,
    private executeSendSelectedIndex: string,
    private executeSendSelectedValue: string | null = null
  ) {
    super({
      [ConfigConstants.executeSend]: executeSend,
      [ConfigConstants.executeSendSelectedIndex]: executeSendSelectedIndex,
      [ConfigConstants.executeSendSelectedValue]: executeSendSelectedValue,
    });
  }

  static fromJson(json: any): SenderExecutor {
    return new SenderExecutor(
      json[ConfigConstants.executeSend],
      json[ConfigConstants.executeSendSelectedIndex],
      json[ConfigConstants.executeSendSelectedValue]
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    _roots: SceneObject[],
    _token: CancellationToken
  ): Promise<void> {
    const senderComponent = paramsList[ConfigConstants.executeSend]
      ? (context.message?.getValue(ConfigConstants.executeSend) as SenderComponent)
      : (context.message?.getValue(SenderComponent.SenderKey) as SenderComponent);

    if (senderComponent && paramsList[ConfigConstants.executeSendSelectedIndex]) {
      const index = ExecuteHelper.tryParse(paramsList[ConfigConstants.executeSendSelectedIndex]);

      if (paramsList[ConfigConstants.executeSendSelectedValue]) {
        const value = ExecuteHelper.tryParse(paramsList[ConfigConstants.executeSendSelectedValue]);
        senderComponent.invokeSend(index, value);
      } else {
        senderComponent.invokeSend(index);
      }
    }
  }
}
