import { RoundMessage } from '../messaging/round_message';
import { MessagingConstants } from '../messaging/messaging_constants';

export class MessageExtension {
  static serverIndex(message: RoundMessage): number {
    let serverIndex = -1;
    if (message.has(MessagingConstants.roundNumber)) {
      serverIndex = parseInt(message.getValue(MessagingConstants.roundNumber), 10) ?? -1;
    }
    return serverIndex;
  }

  static multipleRoundStart(message: RoundMessage): boolean {
    let result = false;
    if (message.has(MessagingConstants.multipleRoundStart)) {
      const text = message.getValue(MessagingConstants.multipleRoundStart);
      result = text.toLowerCase() === 'true';
    }
    return result;
  }
}
