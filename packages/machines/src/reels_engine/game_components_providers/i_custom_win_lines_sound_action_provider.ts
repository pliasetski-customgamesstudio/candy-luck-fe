import { Line } from '@cgs/common';
import { IntervalAction } from '@cgs/syd';

export interface ICustomWinLinesSoundActionProvider {
  updateActions(winLines?: Line[]): void;
  startWinLinesSoundAction: IntervalAction;
  stopWinLinesSoundAction: IntervalAction;
}
