import { SceneObject, Container, IntervalAction, SequenceAction, FunctionAction } from '@cgs/syd';

export type RoutineArg2 = (actions: IntervalAction[], node: SceneObject) => void;
export class LineAnimationStrategyWithFade {
  private _node: SceneObject;
  private _container: Container;
  private _applyFadeAction: RoutineArg2;
  private _removeFadeAction: RoutineArg2;

  constructor(container: Container) {
    this._container = container;
  }

  withActions(
    container: Container,
    addFade: RoutineArg2,
    removeFade: RoutineArg2
  ): LineAnimationStrategyWithFade {
    this._container = container;
    this._applyFadeAction = addFade;
    this._removeFadeAction = removeFade;
    return this;
  }

  withStrategyFadeOnBegin(container: Container): LineAnimationStrategyWithFade {
    this._container = container;

    this._applyFadeAction = this.applyFadeAction;
    this._removeFadeAction = (list, node) => {};
    return this;
  }

  withStrategyFadeOnEnd(container: Container): LineAnimationStrategyWithFade {
    this._container = container;

    this._applyFadeAction = (list, node) => {};
    this._removeFadeAction = this.removeFadeAction;
    return this;
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    const actions: IntervalAction[] = [];
    this._applyFadeAction(actions, this._node);
    actions.push(animation);
    this._removeFadeAction(actions, this._node);

    return new SequenceAction(actions);
  }

  removeFadeAction(actions: IntervalAction[], node: SceneObject): void {
    actions.push(new FunctionAction(() => this.enableFade(node, false), true));
  }

  applyFadeAction(actions: IntervalAction[], node: SceneObject): void {
    actions.push(new FunctionAction(() => this.enableFade(node, true), false));
  }

  enableFade(node: SceneObject, enable: boolean): void {
    // var slot = (_container.resolve(ResourcesComponent) as ResourcesComponent).slot;
    // var fadeSceneObject = slot.findById("fade_static_icons");
    //
    // fadeSceneObject.stateMachine.dispatchEvent(new ParamEvent<String>(enable ? "anim" : "default"));
  }
}
