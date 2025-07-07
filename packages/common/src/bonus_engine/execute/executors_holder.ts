import { IExecutorsHolder } from './i_executors_holder';
import { Log, SceneObject } from '@cgs/syd';
import { LinkedState } from './executers/linked_state';
import { BonusContext } from '../messaging/bonus_context';
import { RoundMessage } from '../messaging/round_message';
import { CancellationToken } from '../../future/cancellation_token';
import { MessageContext } from './message_context';
import { ConditionExtension } from '../utils/condition_extension';

export class ExecutorsHolder implements IExecutorsHolder {
  private readonly _roots: SceneObject[] = [];
  private readonly _states: LinkedState[] = [];
  private readonly _bonusContext: BonusContext;

  constructor(roots: SceneObject[], states: LinkedState[], bonusContext: BonusContext) {
    this._roots = roots;
    this._states = states;
    this._bonusContext = bonusContext;
  }

  public async execute(message: RoundMessage, token: CancellationToken): Promise<void> {
    if (this._states.length) {
      const messageContext = new MessageContext(message, this._bonusContext);
      let playingState = this._states.find(
        (state) =>
          state.messageType == message.type &&
          state.condition &&
          ConditionExtension.check(state.condition, messageContext)
      );
      if (!playingState) {
        playingState = this._states.find(
          (state) => state.messageType == message.type && !state.condition
        );
      }
      if (playingState) {
        Log.Debug(`${new Date()}: Execute Message: ${playingState.messageType}`);
        await playingState.play(messageContext, this._roots, token);
      }
    }
  }
}
