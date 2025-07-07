import { IntervalAction } from '@cgs/syd';
import { IAnimationStrategy } from './i_animation_strategy';

export class RegularWinLineAnimationStrategy implements IAnimationStrategy {
  static Strategy(): IAnimationStrategy {
    return new RegularWinLineAnimationStrategy();
  }

  applyStrategy(winLineAction: IntervalAction): IntervalAction {
    return winLineAction;
  }
}
