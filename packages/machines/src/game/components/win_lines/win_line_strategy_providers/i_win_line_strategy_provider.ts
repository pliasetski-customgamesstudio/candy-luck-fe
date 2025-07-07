import { IAnimationStrategy } from '../../animation_strategies/i_animation_strategy';

export interface IWinLineStrategyProvider {
  getShortWinLineStrategy(): IAnimationStrategy;
  getSpecialWinLineStrategy(): IAnimationStrategy;
  getWinLineStrategy(): IAnimationStrategy;
}
