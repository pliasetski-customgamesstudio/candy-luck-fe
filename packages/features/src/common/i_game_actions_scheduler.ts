import { Func0 } from '@cgs/shared';

export interface IGameActionsScheduler {
  scheduleAction(popupAction: Func0<Promise<void>>): void;
}
