type RoutineArg2 = (actions: List<IntervalAction>, node: SceneObject) => void;

class LineAnimationStrategyWithFade extends IAnimationStrategy {
  private _node: SceneObject;
  private _container: Container;

  private _applyFadeAction: RoutineArg2;
  private _removeFadeAction: RoutineArg2;

  constructor(container: Container) {
    this._container = container;
  }

  constructor(container: Container, addFade: RoutineArg2, removeFade: RoutineArg2) {
    this._container = container;
    this._applyFadeAction = addFade;
    this._removeFadeAction = removeFade;
  }

  constructor(container: Container, addFade: RoutineArg2) {
    this._container = container;

    this._applyFadeAction = addFade;
    this._removeFadeAction = (list, node) => {};
  }

  constructor(container: Container, removeFade: RoutineArg2) {
    this._container = container;

    this._applyFadeAction = (list, node) => {};
    this._removeFadeAction = removeFade;
  }

  applyStrategy(animation: IntervalAction): IntervalAction {
    const actions: List<IntervalAction> = new List<IntervalAction>();
    this._applyFadeAction(actions, this._node);
    actions.add(animation);
    this._removeFadeAction(actions, this._node);

    return new SequenceAction(actions);
  }

  removeFadeAction(actions: List<IntervalAction>, node: SceneObject): void {
    actions.add(new FunctionAction(() => this.enableFade(node, false), true));
  }

  applyFadeAction(actions: List<IntervalAction>, node: SceneObject): void {
    actions.add(new FunctionAction(() => this.enableFade(node, true), false));
  }

  strategy(container: Container): IAnimationStrategy {
    return new LineAnimationStrategyWithFade(container);
  }

  strategyFadeWrap(container: Container): IAnimationStrategy {
    return new LineAnimationStrategyWithFade(container);
  }

  enableFade(node: SceneObject, enable: boolean): void {
    //    const slot = (this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent) as ResourcesComponent).slot;
    //    const fadeSceneObject = slot.findById("fade_static_icons");
    //
    //    fadeSceneObject.stateMachine.dispatchEvent(new ParamEvent<String>(enable ? "anim" : "default"));
  }
}
