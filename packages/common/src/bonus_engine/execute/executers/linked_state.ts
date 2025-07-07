import { IExecuteData } from './i_execute_data';
import { parseRoundMessageTypeEnum, RoundMessageType } from '../../enums/round_message_type';
import { ConditionConfiguration } from '../../configuration/elements/condition_configuration';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ConfigConstants } from '../../configuration/config_constants';
import { ExecuteDataFactory } from '../execute_data_factory';

export class LinkedState implements IExecuteData {
  static fromJson(json: any): LinkedState {
    return new LinkedState(
      parseRoundMessageTypeEnum(json[ConfigConstants.messageType]),
      json[ConfigConstants.condition]
        ? new ConditionConfiguration(json[ConfigConstants.condition])
        : null,
      json[ConfigConstants.executeData].map((j: any) => ExecuteDataFactory.Create(j))
    );
  }

  messageType: RoundMessageType;
  condition: ConditionConfiguration | null;
  private readonly _executors: IExecuteData[];

  constructor(
    name: RoundMessageType,
    condition: ConditionConfiguration | null,
    data: IExecuteData[]
  ) {
    this.messageType = name;
    this.condition = condition;
    this._executors = data;
  }

  async play(
    context: IMessageContext,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    for (const executor of this._executors) {
      await executor.play(context, roots, token);
      token.throwIfCancellationRequested();
    }
  }
}
