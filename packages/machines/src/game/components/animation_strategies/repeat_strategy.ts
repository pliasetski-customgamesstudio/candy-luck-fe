import { IntervalAction, RepeatAction } from '@cgs/syd';
import { IAnimationStrategy } from './i_animation_strategy';

export class RepeatStrategy implements IAnimationStrategy {
  applyStrategy(animation: IntervalAction): IntervalAction {
    return new RepeatAction(animation);
  }
}
