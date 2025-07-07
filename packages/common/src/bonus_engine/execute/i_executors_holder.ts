import { RoundMessage } from '../messaging/round_message';
import { CancellationToken } from '../../future/cancellation_token';

export interface IExecutorsHolder {
  execute(message: RoundMessage, token: CancellationToken): Promise<void>;
}
