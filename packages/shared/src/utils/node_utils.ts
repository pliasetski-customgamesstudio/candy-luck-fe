import {
  SceneObject,
  AbstractMouseEvent,
  State,
  Vector2,
  Matrix3,
  SwipeDirection,
  TextureSceneObject,
  TextureResource,
  StateMachine,
  ParallelState,
  IDisposable,
  ParamEvent,
  Completer,
  SequenceAction,
  FunctionAction,
  IntervalAction,
  toRadians,
  Constructor,
  Effect,
  FrameUpdateScene,
  MouseDownEvent,
  MousePointerMoveEvent,
  MouseUpEvent,
} from '@cgs/syd';
import { Func1, VoidFunc0, VoidFunc1 } from '../func/func_imp';
import { Logger } from './logger';
import { DisposeAction } from './dispose_action';

export class NodeUtils {
  static reallyHidden(node: SceneObject): boolean {
    if (node.hidden) {
      return true;
    }
    if (!node.parent) {
      return false;
    }
    return this.reallyHidden(node.parent);
  }

  static reallyInitialized(node: SceneObject): boolean {
    if (node.id === 'RootScene') {
      return true;
    }
    if (!node.isInitialized) {
      return false;
    }
    if (!node.parent) {
      return true;
    }
    return this.reallyInitialized(node.parent);
  }

  static acceptTouch(node: SceneObject): VoidFunc1<any> {
    return (e: any) => {
      if (e instanceof AbstractMouseEvent) {
        const inside = node.isInPoint(e.event.location);
        if (inside) {
          e.accept();
        }
      }
    };
  }

  static anyActiveStateWithName(node: SceneObject, stateId: string): boolean {
    return !!node.stateMachine?.isActive(stateId);
  }

  static anyActiveStateWithName1(st: State, stateId: string): boolean {
    return st.isActive(stateId);
  }

  static anyActiveState(node: SceneObject, condition: Func1<State, boolean>): boolean {
    return !!this.getFirstActiveState(node.stateMachine!, condition);
  }

  static isAnyActiveState(node: SceneObject, states: string[]): boolean {
    return states.some((state) => node.stateMachine?.isActive(state));
  }

  static stateContains(st: State, stateId: string): boolean {
    const firstActiveState = this.getFirstActiveState(st, (st) => st.name.includes(stateId));
    return !!firstActiveState;
  }

  static sendEventIfNeeded(node: SceneObject, dis: string): void {
    if (!node.stateMachine?.isActive(dis)) {
      node.stateMachine?.dispatchEvent(new ParamEvent<string>(dis));
    }
  }

  static async sendEventAndWait(node: SceneObject, stateId: string): Promise<void> {
    Logger.Info(`SendEventAndWait start ${node.id ?? 'NO_ID'}: ${stateId}`);

    const completion = new Completer<boolean>();
    this.sendEventWithCompleteAction(node, stateId, () => completion.complete(true));
    await completion.promise;

    Logger.Info(`SendEventAndWait end ${node.id ?? 'NO_ID'}: ${stateId}`);
  }

  static sendEventWithCompleteAction(
    node: SceneObject,
    stateId: string,
    onComplete: VoidFunc0
  ): void {
    const state = node.stateMachine!.findById(stateId)!;
    const action = state.enterAction;
    state.enterAction = new SequenceAction([
      action as IntervalAction,
      new FunctionAction(() => {
        state.enterAction = action;
        onComplete();
      }),
    ]);
    node.stateMachine!.switchToState(stateId);
  }

  static addTextureWithScale(container: SceneObject, imageTexture: TextureResource): void {
    const textureSceneObject = new TextureSceneObject();
    textureSceneObject.source = imageTexture;

    const scaleCoef = Math.min(
      container.size.x / imageTexture.texture!.width,
      container.size.y / imageTexture.texture!.height
    );
    textureSceneObject.scale = new Vector2(scaleCoef, scaleCoef);

    container.addChild(textureSceneObject);
  }

  static getNodeCenter_nullable(node: SceneObject | null = null): Vector2 | null {
    if (node) {
      return new Vector2(node.worldTransform.tx, node.worldTransform.ty).add(
        node.worldTransform.extractScale().multiply(this.getCenter(node))
      );
    }
    return null;
  }

  static getNodeCenter(node: SceneObject): Vector2 {
    return new Vector2(node.worldTransform.tx, node.worldTransform.ty).add(
      node.worldTransform.extractScale().multiply(this.getCenter(node))
    );
  }

  static getNodeCenterTransform(node: SceneObject): Matrix3 {
    const position =
      !node.bounds || node.bounds.width === 0 || node.bounds.height === 0
        ? node.touchArea.center
        : node.bounds.center;

    const localTransform = Matrix3.undefined();
    Matrix3.Make(
      node.scale,
      toRadians(node.skew.x),
      toRadians(node.skew.y),
      toRadians(node.rotation),
      node.pivot,
      position,
      localTransform
    );
    const parentTransform = node.parent ? node.parent.worldTransform : Matrix3.Identity;
    const res = Matrix3.undefined();
    Matrix3.Multiply(localTransform, parentTransform, res);
    return res;
  }

  static getCenter(node: SceneObject): Vector2 {
    return !node.bounds || node.bounds.width === 0 || node.bounds.height === 0
      ? !node.touchArea
        ? !node.size
          ? Vector2.Zero
          : new Vector2(node.size.x / 2.0, node.size.y / 2.0)
        : node.touchArea.center
      : node.bounds.center;
  }

  static getWorldPosition_nullable(sceneObject: SceneObject | null = null): Vector2 | null {
    if (sceneObject) {
      return this.getWorldPosition(sceneObject);
    }
    return null;
  }

  static getWorldPosition(sceneObject: SceneObject): Vector2 {
    return new Vector2(sceneObject.worldTransform.tx, sceneObject.worldTransform.ty);
  }

  static worldPosition(sceneObject: SceneObject, root: SceneObject | null = null): Vector2 {
    let cur = sceneObject;
    let result = cur.position.clone();
    while (cur.parent && cur != root) {
      cur = cur.parent;
      result = result.multiply(cur.scale);
      result = result.add(cur.position);
    }
    return result;
  }

  static worldPosition_nullable(
    sceneObject: SceneObject,
    root: SceneObject | null = null
  ): Vector2 | null {
    if (sceneObject) {
      return this.worldPosition(sceneObject, root);
    }
    return null;
  }

  static getPositionToParent(sceneObject: SceneObject, root: SceneObject | null = null): Vector2 {
    let cur: SceneObject | null = sceneObject;
    if (cur === root) {
      return Vector2.Zero;
    }
    let result = Vector2.Zero;
    for (; cur && cur !== root; cur = cur.parent) {
      result = result.add(cur.position.subtract(cur.pivot.multiply(cur.scale)));
      result = result.multiply(cur.scale);
    }
    return result;
  }

  static getScaleToParent(sceneObject: SceneObject, root: SceneObject | null = null): Vector2 {
    let cur: SceneObject | null = sceneObject;
    if (cur == root) {
      return Vector2.One;
    }
    let result = Vector2.One;
    for (; cur && cur !== root; cur = cur.parent) {
      result = result.multiply(cur.scale);
    }
    return result;
  }

  static getCenterToParent(sceneObject: SceneObject, root: SceneObject | null = null): Vector2 {
    return this.getPositionToParent(sceneObject, root).add(
      this.getScaleToParent(sceneObject, root).multiply(this.getCenter(sceneObject))
    );
  }

  static positionToParent(node: SceneObject, parent: SceneObject): Vector2 {
    return parent.inverseTransform.transformVector(
      new Vector2(node.worldTransform.tx, node.worldTransform.ty)
    );
  }

  static centerPositionToParent(node: SceneObject, parent: SceneObject): Vector2 {
    return parent.inverseTransform.transformVector(
      new Vector2(node.worldTransform.tx, node.worldTransform.ty).add(
        node.worldTransform.extractScale().multiply(this.getCenter(node))
      )
    );
  }

  static hitTest(sceneObject: SceneObject, location: Vector2): boolean {
    if (sceneObject.touchable && sceneObject.touchArea) {
      const local = sceneObject.inverseTransform.transformVector(location);
      if (sceneObject.touchArea.test(local)) {
        return true;
      }
    }
    return false;
  }

  static traverse(
    nodeType: Constructor<any>,
    root: SceneObject,
    routine: VoidFunc1<SceneObject>
  ): void {
    if (root instanceof nodeType) {
      routine(root);
    }
    for (const child of root.childs) {
      this.traverse(nodeType, child, routine);
    }
  }

  static traverseAll(root: SceneObject, routine: VoidFunc1<SceneObject>): void {
    routine(root);
    for (const child of root.childs) {
      this.traverseAll(child, routine);
    }
  }

  static getRoot(node: SceneObject): SceneObject {
    let root = node;
    while (root.parent) {
      root = root.parent;
    }
    return root;
  }

  static removeEffects(node: SceneObject): SceneObject {
    if (node.effect) {
      node.effect = null;
    }

    node.childs.forEach((child) => this.removeEffects(child));

    return node;
  }

  static removeMask(node: SceneObject): SceneObject {
    if (node.effect) {
      node.effect = node.effect & ~Effect.Mask1 & ~Effect.Mask2;
    }

    node.childs.forEach((child) => this.removeMask(child));

    return node;
  }

  static addMask(node: SceneObject): SceneObject {
    if (node.effect) {
      node.effect = node.effect & Effect.Mask1 & Effect.Mask2;
    }

    node.childs.forEach((child) => this.addMask(child));

    return node;
  }

  static registerForSwipeEvent(node: SceneObject, func: VoidFunc1<SwipeDirection>): IDisposable {
    const updateNode = new FrameUpdateScene();
    let time = 0.0;
    let beginTime = 0.0;
    let squareDistance = 0.0;
    let prevDirection = SwipeDirection.left;
    let prevTouch: MouseDownEvent | null = null;
    const framePulsateSub = updateNode.framePulsate.listen((dt) => {
      if (dt !== undefined) {
        time += dt;
      }
    });
    const eventReceivedSub = node.eventReceived.listen((e) => {
      if (e instanceof MouseDownEvent) {
        beginTime = time;
        prevTouch = e as MouseDownEvent;
      } else if (e instanceof MousePointerMoveEvent) {
        if (prevTouch) {
          const dx = Math.round(prevTouch.event.location.x - e.event.location.x);
          const dy = Math.round(prevTouch.event.location.y - e.event.location.y);

          const mdx = dx < 0 ? -dx : dx;
          const mdy = dy < 0 ? -dy : dy;

          let direction = prevDirection;

          if (mdx > mdy) {
            if (dx > 0) direction = SwipeDirection.left;
            else if (dx < 0) direction = SwipeDirection.right;
          } else if (mdx < mdy) {
            if (dy > 0) direction = SwipeDirection.up;
            else if (dy < 0) direction = SwipeDirection.down;
          }

          if (prevDirection == SwipeDirection.unknown || prevDirection == direction) {
            prevTouch = e;
            prevDirection = direction;
            squareDistance += dx * dx + dy * dy;
          } else {
            prevTouch = null;
            prevDirection = SwipeDirection.unknown;
            squareDistance = 0.0;
          }
        }
      } else if (e instanceof MouseUpEvent) {
        if (prevTouch && prevDirection != SwipeDirection.unknown) {
          const dt = time - beginTime;
          if (dt > 0) {
            const factor = squareDistance / dt;
            if (factor > 3) {
              Logger.Debug('direction ${prevDirection} factor ${factor}');
              if (func) {
                func(prevDirection);
              }
            }
          }

          prevTouch = null;
          prevDirection = SwipeDirection.unknown;
          squareDistance = 0.0;
        }
      }
    });
    node.addChild(updateNode);
    return new DisposeAction(() => {
      node.removeChild(updateNode);
      eventReceivedSub.cancel();
      framePulsateSub.cancel();
    });
  }

  static setTextureWithScale(destination: TextureSceneObject, texture: TextureResource): void {
    if (texture?.texture) {
      const scaleCoef = Math.min(
        destination.size.x / texture.texture.width,
        destination.size.y / texture.texture.height
      );
      const scale = new Vector2(scaleCoef, scaleCoef);
      destination.scale = scale;
      destination.source = texture;
    } else {
      destination.source = null;
    }
    destination.dimensionSource = null;
  }

  static getFirstActiveState(state: State, condition: Func1<State, boolean>): State | null {
    let states: State[] = [];
    if (state instanceof StateMachine) {
      states = state.states.map((p) => p.state);
    } else if (state instanceof ParallelState) {
      states = state.states;
    }

    for (const childState of states) {
      const firstState = this.getFirstChildState(state, childState, condition);
      if (firstState) {
        return firstState;
      }
    }
    return null;
  }

  static getFirstChildState(
    parentState: State,
    childState: State,
    condition: Func1<State, boolean>
  ): State | null {
    if (condition(childState)) {
      if (parentState.isActive(childState.name)) {
        return childState;
      }
    } else if (childState instanceof StateMachine) {
      const innerRes = this.getFirstActiveState(childState, condition);
      if (innerRes) {
        return innerRes;
      }
    }

    return null;
  }

  static foreachChildState(state: State, action: VoidFunc1<State>): void {
    action(state);
    if (state instanceof StateMachine) {
      for (const activeState of state.states) {
        this.foreachChildState(activeState.state, action);
      }
    }
  }

  static removeAllChildsDisposing(parent: SceneObject): void {
    while (parent.childs.length > 0) {
      const child = parent.childs[0];
      this.removeChildDisposing(child);
    }
  }

  static removeChildDisposing(child: SceneObject): void {
    child.parent?.removeChild(child);
    child.deinitialize();
    child.dispose();
  }

  static getLocalPositionFromPoint(
    nodeParent: SceneObject,
    destination: SceneObject,
    point: Vector2
  ): Vector2 {
    const worldPos = nodeParent.worldTransform.transformPoint(point.x, point.y);
    const inverse = new Matrix3(0, 0, 0, 0, 0, 0);
    Matrix3.Inverse(destination.worldTransform, inverse);

    return inverse.transformPoint(worldPos.x, worldPos.y);
  }
}
