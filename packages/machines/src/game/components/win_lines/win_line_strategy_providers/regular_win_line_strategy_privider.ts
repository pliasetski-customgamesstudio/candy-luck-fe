import { Container } from '@cgs/syd';
import { ComplexWinLineAnimaitionWithCheckStategy } from '../../animation_strategies/complex_win_line_animaition_with_check_stategy';
import { IAnimationStrategy } from '../../animation_strategies/i_animation_strategy';
import { LineAnimationStrategyWithFade } from '../../animation_strategies/line_animation_strategy_with_fade';
import { RegularWinLineAnimationStrategy } from '../../animation_strategies/regular_line_animation_strategy';
import { IWinLineStrategyProvider } from './i_win_line_strategy_provider';
import { RepeatStrategy } from '../../animation_strategies/repeat_strategy';

export class RegularWinLineStrategyPrivider implements IWinLineStrategyProvider {
  protected _container: Container;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    this._container = container;
  }

  getShortWinLineStrategy(): IAnimationStrategy {
    const result = new ComplexWinLineAnimaitionWithCheckStategy();

    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnBegin(this._container)
    );
    result.addToEnd(RegularWinLineAnimationStrategy.Strategy());
    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnEnd(this._container)
    );

    return result;
  }

  getSpecialWinLineStrategy(): IAnimationStrategy {
    const result = new ComplexWinLineAnimaitionWithCheckStategy();

    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnBegin(this._container)
    );
    result.addToEnd(RegularWinLineAnimationStrategy.Strategy());
    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnEnd(this._container)
    );

    return result;
  }

  getWinLineStrategy(): IAnimationStrategy {
    const result = new ComplexWinLineAnimaitionWithCheckStategy();

    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnBegin(this._container)
    );
    result.addToEnd(new RepeatStrategy());
    result.addToEnd(
      new LineAnimationStrategyWithFade(this._container).withStrategyFadeOnEnd(this._container)
    );

    return result;
  }
}
