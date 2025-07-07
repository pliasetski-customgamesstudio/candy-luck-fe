import { IntervalAction, SequenceAction, EmptyAction } from '@cgs/syd';
import { IAnimationStrategy } from './i_animation_strategy';

export class SubstituteAnimationStrategy implements IAnimationStrategy {
  private _substituteAnimationActions: IntervalAction[];

  constructor(substituteAnimationActions: IntervalAction[]) {
    this._substituteAnimationActions = substituteAnimationActions;
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    return new SequenceAction([animation, new SequenceAction(this._substituteAnimationActions)]);
  }
}

export class EmptyStrategy implements IAnimationStrategy {
  applyStrategy(animation: IntervalAction): IntervalAction {
    return new EmptyAction().withDuration(0);
  }
}
