import { IAnimationStrategy } from 'machines';
import { IntervalAction } from 'syd';

class ComplexLineAnimAnimationStrategy implements IAnimationStrategy {
  private _strategies: IAnimationStrategy[] = [];

  get strategies(): IAnimationStrategy[] {
    return this._strategies;
  }

  constructor() {}

  addToBegin(strategy: IAnimationStrategy): void {
    this._strategies.unshift(strategy);
  }

  addToEnd(strategy: IAnimationStrategy): void {
    this._strategies.push(strategy);
  }

  addAllToEnd(strategies: IAnimationStrategy[]): void {
    this._strategies.push(...strategies);
  }

  addAllToBegin(strategies: IAnimationStrategy[]): void {
    for (let index = strategies.length - 1; index >= 0; index--) {
      const s = strategies[index];
      this.addToBegin(s);
    }
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    for (let index = 0; index < this._strategies.length; index++) {
      const animationStrategy = this._strategies[index];
      animation = animationStrategy.applyStrategy(animation);
    }

    return animation;
  }
}
