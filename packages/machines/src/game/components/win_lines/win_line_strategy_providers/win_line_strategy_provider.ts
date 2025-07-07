import { RegularWinLineStrategyPrivider } from './regular_win_line_strategy_privider';
import { Container } from '@cgs/syd';
import { IAnimationStrategy } from '../../animation_strategies/i_animation_strategy';
import { LineAnimationStrategyWithFade } from '../../animation_strategies/line_animation_strategy_with_fade';

export class WinLineStrategyProvider extends RegularWinLineStrategyPrivider {
  constructor(container: Container) {
    super(container);
    console.log('load ' + this.constructor.name);
  }

  getWinLineStrategy(): IAnimationStrategy {
    return new LineAnimationStrategyWithFade(this._container);
  }
}
