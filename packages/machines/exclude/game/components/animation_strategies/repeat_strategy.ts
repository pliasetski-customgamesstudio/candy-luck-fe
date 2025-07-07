import { IntervalAction, RepeatAction } from 'machines';
import { IAnimationStrategy } from 'syd';

class RepeatStrategy implements IAnimationStrategy {
  applyStrategy(animation: IntervalAction): IntervalAction {
    return new RepeatAction(animation);
  }
}
