import { Action } from '@cgs/syd';

export interface ISlotPrimaryActionsProvider {
  getStartSlotAction(): Action;
  getStopSlotAction(): Action;
  getImmediatelyStopSlotAction(): Action;
  getWinLinesAction(): Action;
  getRespinWinLinesAction(): Action;
  getShortWinLinesAction(): Action;
  getSpecialWinLinesAction(): Action;
}
