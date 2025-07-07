import { IAnimationStrategy } from 'machines';
import { IntervalAction } from 'syd';

class RegularWinLineAnimationStrategy implements IAnimationStrategy {
  static Strategy(): IAnimationStrategy {
    return new RegularWinLineAnimationStrategy();
  }

  applyStrategy(winLineAction: IntervalAction): IntervalAction {
    return winLineAction;
  }
}
