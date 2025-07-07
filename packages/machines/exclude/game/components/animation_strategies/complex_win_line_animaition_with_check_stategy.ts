import { ComplexLineAnimAnimationStrategy } from 'machines';
import { ActionExtension, IntervalAction } from 'syd';

class ComplexWinLineAnimaitionWithCheckStategy extends ComplexLineAnimAnimationStrategy {
  constructor() {
    super();
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    if (ActionExtension.ContainWinLines(animation)) {
      for (let index = 0; index < this.strategies.length; index++) {
        let animationStrategy = this.strategies[index];
        animation = animationStrategy.applyStrategy(animation);
      }
      return animation;
    } else {
      return animation;
    }
  }
}
