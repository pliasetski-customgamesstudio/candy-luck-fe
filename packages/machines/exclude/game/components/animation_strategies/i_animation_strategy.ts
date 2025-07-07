import { IntervalAction } from 'syd';

export interface IAnimationStrategy {
  applyStrategy(animation: IntervalAction): IntervalAction;
}
