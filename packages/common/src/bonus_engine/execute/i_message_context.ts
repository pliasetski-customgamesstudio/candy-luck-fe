import { RoundMessage } from '../messaging/round_message';

export interface IMessageContext {
  message: RoundMessage | null;

  resolve(elementId: string): string[];
}
