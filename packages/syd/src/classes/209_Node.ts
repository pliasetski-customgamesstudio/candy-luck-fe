import { SceneObject } from './288_SceneObject';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { Vector2 } from './15_Vector2';
import { Matrix3 } from './57_Matrix3';
import { CgsEvent } from './12_Event';
import { toRadians } from './globalFunctions';
import { SceneObjectType } from './SceneObjectType';

export abstract class CGSNode {
  abstract get runtimeType(): SceneObjectType;

  private _parent: SceneObject | null = null;
  private _childs: SceneObject[] = [];
  public blockEvents: boolean = false;

  private _position: Vector2 = Vector2.Zero.clone();
  private _pivot: Vector2 = Vector2.Zero.clone();

  private _skew: Vector2 = Vector2.Zero.clone();
  private _scale: Vector2 = Vector2.One;

  private _rotation: number = 0.0;

  private _localTransform: Matrix3 = Matrix3.undefined();
  private _worldTransform: Matrix3 = Matrix3.undefined();
  private _inverseTransform: Matrix3 = Matrix3.undefined();

  private _localTransformDirty: boolean = true;
  private _worldTransformDirty: boolean = true;
  private _inverseTransformDirty: boolean = true;

  protected _hierarchyDirty: boolean = true;
  private _z: number = 0;

  private _eventReceivedDispatcher: EventDispatcher<CgsEvent> = new EventDispatcher<CgsEvent>();

  public get eventReceived(): EventStream<CgsEvent> {
    return this._eventReceivedDispatcher.eventStream;
  }

  public get childs(): SceneObject[] {
    if (this._hierarchyDirty) {
      this._childs.sort((a, b) => a.z - b.z);
      this._hierarchyDirty = false;
    }
    return this._childs;
  }

  public get innerChilds(): SceneObject[] {
    return this._childs;
  }

  public get parent(): SceneObject | null {
    return this._parent;
  }

  public get z(): number {
    return this._z;
  }

  public set z(value: number) {
    if (this._z !== value) {
      this._z = value;

      if (this._parent) {
        this._parent.setDirty(true);
      }
    }
  }

  public get localTransform(): Matrix3 {
    if (this._localTransformDirty) {
      // todo: optimize)

      /*this._localTransform = new Matrix3.fromTranslation(-this._pivot.x, -this._pivot.y) * new Matrix3.fromScale(this._scale.x, this._scale.y) *
          new Matrix3.fromRotation(toRadians(this._rotation)) * new Matrix3.fromSkew(toRadians(this._skew.x), toRadians(this._skew.y)) *
          new Matrix3.fromTranslation(this._position.x, this._position.y);
      */

      Matrix3.Make(
        this._scale,
        toRadians(this._skew.x),
        toRadians(this._skew.y),
        toRadians(this._rotation),
        this._pivot,
        this._position,
        this._localTransform
      );

      this._localTransformDirty = false;
    }

    return this._localTransform;
  }

  public calculateWorldTransform(parentTransform: Matrix3, result: Matrix3): void {
    Matrix3.Multiply(this.localTransform, parentTransform, result);
  }

  public get worldTransform(): Matrix3 {
    if (this._worldTransformDirty) {
      const parentTransform = this._parent ? this._parent.worldTransform : Matrix3.Identity;
      this.calculateWorldTransform(parentTransform, this._worldTransform);
      this._worldTransformDirty = false;
    }

    return this._worldTransform;
  }

  public get inverseTransform(): Matrix3 {
    if (this._inverseTransformDirty) {
      Matrix3.Inverse(this.worldTransform, this._inverseTransform);
      this._inverseTransformDirty = false;
    }

    return this._inverseTransform;
  }

  public sendEvent(e: CgsEvent): void {
    if (!this.blockEvents) {
      const continueEvent = true;
      /*if (EventFilters.Count > 0)
      {
        var count = EventFilters.Count;
        for (Int32 i = 0; i < count; ++i)
        {
          if (EventFilters[i].FilterEvent(this, e))
          {
            continueEvent = false;
            break;
          }
        }
      }*/
      if (continueEvent) {
        this.processEvent(e);

        if (!e.isAccepted) {
          this._eventReceivedDispatcher.dispatchEvent(e);
        }

        if (!e.isAccepted) {
          this.dispatchEvent(e);
        }
      }
    }
  }

  protected processEvent(e: CgsEvent): void {
    for (let i = this._childs.length - 1; i >= 0; --i) {
      const node = this._childs[i];

      if (node.visible) {
        node.sendEvent(e);
        if (e.isAccepted) break;
      }
    }
  }

  protected dispatchEvent(_event: CgsEvent): void {}

  protected onChildAdded(_child: SceneObject): void {}

  public addChild(child: SceneObject): void {
    //assert(!child._parent);
    if (child._parent) {
      throw new Error('Child already has parent');
    }

    this._childs.push(child);
    if (this instanceof SceneObject) {
      child._parent = this;
    }

    child.invalidateWorldTransform();

    this.onChildAdded(child);

    this._hierarchyDirty = true;
  }

  public removeChild(child: SceneObject): void {
    if (!this._childs.includes(child)) {
      throw new Error('Child not found');
    }

    this._childs.splice(this._childs.indexOf(child), 1);
    child._parent = null;
    child.invalidateWorldTransform();
  }

  //map from mobile
  public removeAllChildren(): void {
    this.removeAllChilds();
  }

  public removeAllChilds(): void {
    const childs = this._childs;
    for (let i = 0; i < childs.length; ++i) {
      const c = childs[i];
      c._parent = null;
      c.invalidateWorldTransform();
    }

    childs.length = 0;
  }

  public traverseAll(routine: (node: SceneObject) => void): void {
    if (this instanceof SceneObject) {
      routine(this);
    } else {
      throw new Error('Not implemented');
    }
    for (const child of this.childs) {
      child.traverseAll(routine);
    }
  }

  public get position(): Vector2 {
    return this._position;
  }

  public set position(value: Vector2) {
    this._position = value;
    this._invalidateLocalTransform();
  }

  public get pivot(): Vector2 {
    return this._pivot;
  }

  public set pivot(value: Vector2) {
    this._pivot = value;
    this._invalidateLocalTransform();
  }

  public get skew(): Vector2 {
    return this._skew;
  }

  public set skew(value: Vector2) {
    this._skew = value;
    this._invalidateLocalTransform();
  }

  public get scale(): Vector2 {
    return this._scale;
  }

  public set scale(value: Vector2) {
    this._scale = value;
    this._invalidateLocalTransform();
  }

  public get rotation(): number {
    return this._rotation;
  }

  public set rotation(value: number) {
    this._rotation = value;
    this._invalidateLocalTransform();
  }

  public restartStateMachine(): void {
    const collection = this._childs;
    for (let i = this._childs.length - 1; i >= 0; --i) {
      const node = collection[i];
      if (node) {
        node.restartStateMachine();
      }
    }
  }

  public invalidateWorldTransform(): void {
    if (!this._worldTransformDirty) {
      this._worldTransformDirty = true;
      this._inverseTransformDirty = true;

      const childs = this._childs;
      for (let i = 0; i < childs.length; ++i) {
        childs[i].invalidateWorldTransform();
      }
    }
  }

  private _invalidateLocalTransform(): void {
    this._localTransformDirty = true;
    this.invalidateWorldTransform();
  }
}
