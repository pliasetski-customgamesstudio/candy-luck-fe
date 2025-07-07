import { Container, IntervalAction, FunctionAction } from '@cgs/syd';
import { ComplexLineAnimAnimationStrategy } from '../../animation_strategies/complex_line_anim_animation_strategy';
import { IAnimationStrategy } from '../../animation_strategies/i_animation_strategy';
import { LineAnimationStrategyWithFade } from '../../animation_strategies/line_animation_strategy_with_fade';
import {
  SubstituteAnimationStrategy,
  EmptyStrategy,
} from '../../animation_strategies/substitute_animation_strategy';
import { T_IFadeReelsProvider } from '../../../../type_definitions';
import { IFadeReelsProvider } from '../i_fade_reels_provider';
import { RegularWinLineStrategyPrivider } from './regular_win_line_strategy_privider';
import { RegularWinLineAnimationStrategy } from '../../animation_strategies/regular_line_animation_strategy';
import { RepeatStrategy } from '../../animation_strategies/repeat_strategy';

export class RegularWinLineWithSubstituteStrategyProvider extends RegularWinLineStrategyPrivider {
  public substituteAnimationAction: IntervalAction | null;
  public expandingAnimationAction: IntervalAction | null;
  private disableFadeAction: IntervalAction;

  constructor(container: Container) {
    super(container);
    console.log('load ' + this.constructor.name);
    this._container = container;
    const fadeReelsProvider = container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider);
    this.disableFadeAction = new FunctionAction(() => fadeReelsProvider.EnableFade(false));
  }

  getShortWinLineStrategy(): IAnimationStrategy {
    const result = new ComplexLineAnimAnimationStrategy();

    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnBegin(this._container)
    );
    result.addToEnd(RegularWinLineAnimationStrategy.Strategy());
    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnEnd(this._container)
    );

    if (this.substituteAnimationAction && this.expandingAnimationAction) {
      result.addToEnd(
        new SubstituteAnimationStrategy([
          this.disableFadeAction,
          this.expandingAnimationAction,
          this.substituteAnimationAction,
          new FunctionAction(() => {
            this.expandingAnimationAction = null;
            this.substituteAnimationAction = null;
          }),
        ])
      );
    }
    return result;
  }

  getWinLineStrategy(): IAnimationStrategy {
    const result = new ComplexLineAnimAnimationStrategy();

    if (this.substituteAnimationAction && this.expandingAnimationAction) {
      result.addToEnd(new EmptyStrategy());
    } else {
      result.addToEnd(
        new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnBegin(this._container)
      );
      result.addToEnd(new RepeatStrategy());
      result.addToEnd(
        new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnEnd(this._container)
      );
    }

    return result;
  }
}
