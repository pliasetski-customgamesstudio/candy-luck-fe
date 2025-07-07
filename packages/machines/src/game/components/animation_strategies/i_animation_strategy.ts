import { IntervalAction } from '@cgs/syd';

export interface IAnimationStrategy {
  applyStrategy(animation: IntervalAction): IntervalAction;
}
