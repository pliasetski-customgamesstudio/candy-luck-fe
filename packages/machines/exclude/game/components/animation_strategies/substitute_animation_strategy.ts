import { IntervalAction, SequenceAction, EmptyAction } from 'machines';
import { IAnimationStrategy } from 'syd';

class SubstituteAnimationStrategy implements IAnimationStrategy {
  private _substituteAnimationActions: IntervalAction[];

  constructor(substituteAnimationActions: IntervalAction[]) {
    this._substituteAnimationActions = substituteAnimationActions;
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    return new SequenceAction([animation, new SequenceAction(this._substituteAnimationActions)]);
  }
}

class EmptyStrategy implements IAnimationStrategy {
  applyStrategy(animation: IntervalAction): IntervalAction {
    return new EmptyAction().withDuration(0.0);
  }
}
