import { SceneObject } from '@cgs/syd';
import { RoundMessage } from '../messaging/round_message';
import { IMessageContext } from '../execute/i_message_context';

export interface IRoundComponent {
  source: SceneObject[];
  name: string;

  proceedMessage(message: RoundMessage): void;
  init(): void;
  deinit(): void;
  execute(method: string, context: IMessageContext, args: Record<string, string>): void;
}
