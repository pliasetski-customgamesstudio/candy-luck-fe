import { IntervalAction } from '@cgs/syd';

export const T_LogoAnimationProvider = Symbol('LogoAnimationProvider');

export interface ILogoAnimationProvider {
  getLogoAnimationAction(symbolId: number): IntervalAction;
  stopLogoAnimation(): void;
  getShortWinLineAction(): IntervalAction;
}
