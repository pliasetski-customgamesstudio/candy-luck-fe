import { IntervalAction } from '@cgs/syd';
import { ComplexLineAnimAnimationStrategy } from './complex_line_anim_animation_strategy';
import { ActionExtension } from './action_extension';

export class ComplexWinLineAnimaitionWithCheckStategy extends ComplexLineAnimAnimationStrategy {
  constructor() {
    super();
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    if (ActionExtension.ContainWinLines(animation)) {
      for (let index = 0; index < this.strategies.length; index++) {
        var animationStrategy = this.strategies[index];
        animation = animationStrategy.applyStrategy(animation);
      }
      return animation;
    } else {
      return animation;
    }
  }
}
