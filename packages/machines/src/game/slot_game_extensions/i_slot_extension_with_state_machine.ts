import { ISpinResponse } from '@cgs/common';
import { ISlotExtension } from './i_slot_extension';
import { ExtendedGameStateMachine } from '../../reels_engine/state_machine/extended_game_state_machine';
import { StateMachineTransition } from '../components/extended_components/state_machine_transition';

export function f_iSlotExtensionWithStateMachine<TResponse extends ISpinResponse>(
  object: any
): object is ISlotExtensionWithStateMachine<TResponse> {
  return (
    object &&
    typeof object.getInitialRequiredTypes === 'function' &&
    typeof object.getExtensionComponents === 'function' &&
    typeof object.registerStateMachineExtensionTransitions === 'function'
  );
}
export interface ISlotExtensionWithStateMachine<TResponse extends ISpinResponse>
  extends ISlotExtension {
  registerStateMachineExtensionTransitions(
    stateMachine: ExtendedGameStateMachine<TResponse>
  ): StateMachineTransition[];
}
