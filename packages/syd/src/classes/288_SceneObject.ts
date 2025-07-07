import { IComponent } from './113_IComponent';
import { CgsEvent } from './12_Event';
import { Vector2 } from './15_Vector2';
import { State } from './208_State';
import { CGSNode } from './209_Node';
import { Mask } from './211_Mask';
import { PrimitivesRenderer } from './227_PrimitivesRenderer';
import { SpriteBatch } from './248_SpriteBatch';
import { IntervalAction } from './50_IntervalAction';
import { EventDispatcher } from './78_EventDispatcher';
import { BlendResource } from './154_BlendResource';
import { ImageAdjust } from './55_ImageAdjust';
import { RasterizerState } from './65_RasterizerState';
import { Rect } from './112_Rect';
import { Effect } from './89_Effect';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { Color4 } from './10_Color4';
import { Matrix3 } from './57_Matrix3';
import { DebugUtils } from './96_DebugUtils';
import { IDisposable } from './5_Disposable';
import { Constructor } from './TypeUtils';
import { EventStream } from './22_EventStreamSubscription';
import { SceneObjectType } from './SceneObjectType';

export const T_SceneObject = Symbol('SceneObject');
export class SceneObject extends CGSNode implements IComponent, IDisposable {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Node;
  }
  setDirty(dirtyFlag: boolean) {
    this._hierarchyDirty = dirtyFlag;
  }

  blend: BlendResource;
  private _animations: Record<string, IntervalAction> | null = null;
  private _stateMachine: State | null = null;
  private _imageAdjust: ImageAdjust;
  rasterState: RasterizerState | null = null;

  mask: Mask;

  private _size: Vector2 = Vector2.Zero;
  bounds: Rect = Rect.Empty;

  get size(): Vector2 {
    return this._size;
  }

  set size(v: Vector2) {
    this._size = v;
  }

  timeScale: number = 1.0;

  effect: Effect | null = null;

  touchable: boolean = false;
  touchArea: Rect = Rect.Empty;
  private _touchEventDispatcher: EventDispatcher<AbstractMouseEvent> =
    new EventDispatcher<AbstractMouseEvent>();

  get touchEvent(): EventStream<AbstractMouseEvent> {
    return this._touchEventDispatcher.eventStream;
  }

  private _visibleChangeEventDispatcher: EventDispatcher<SceneObject> =
    new EventDispatcher<SceneObject>();

  get visibleChanged(): EventDispatcher<SceneObject> {
    return this._visibleChangeEventDispatcher;
  }

  private _active: boolean = true;

  captureMouse: boolean = false;

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    const notify: boolean = this._active !== value;
    this._active = value;

    if (notify) {
      this._notifyActiveChanged(value);
    }
  }

  get hidden(): boolean {
    return !this.visible && !this.active;
  }

  set hidden(value: boolean) {
    this.visible = this.active = !value;
  }

  private _visible: boolean = true;
  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    const notify: boolean = this._visible !== value;
    this._visible = value;

    if (notify) {
      this._visibleChangeEventDispatcher.dispatchEvent(this);
    }
  }

  get animations(): Record<string, IntervalAction> | null {
    return this._animations;
  }

  set animations(value: Record<string, IntervalAction>) {
    this._animations = value;
  }

  id: string;

  color: Color4;

  private _initialized: boolean = false;

  get isInitialized(): boolean {
    return this._initialized;
  }

  get stateMachine(): State | null {
    return this._stateMachine;
  }

  set stateMachine(value: State) {
    this._stateMachine = value;
  }

  get imageAdjust(): ImageAdjust {
    if (!this._imageAdjust) {
      this._imageAdjust = new ImageAdjust();
    }
    return this._imageAdjust;
  }

  get imageAdjustInner(): ImageAdjust {
    return this._imageAdjust;
  }

  getAnimation(id: string): IntervalAction | null {
    return this._animations ? this._animations[id] ?? null : null;
  }

  onChildAdded(child: SceneObject): void {
    if (this.isInitialized && !child.isInitialized) {
      child.initialize();
    }
  }

  initialize(): void {
    if (this._initialized) {
      return;
    }

    const childs = this.innerChilds;
    for (let i = 0; i < childs.length; ++i) {
      childs[i].initialize();
    }

    if (this._stateMachine) {
      this._stateMachine.start();
    }

    this.initializeImpl();
    this._initialized = true;
  }

  initializeImpl(): void {}

  deinitialize(): void {
    this._initialized = false;
    this.deinitializeImpl();

    if (this._stateMachine) {
      this._stateMachine.onLeave();
    }

    const childs = this.innerChilds;
    for (let i = 0; i < childs.length; ++i) {
      childs[i].deinitialize();
    }
  }

  deinitializeImpl(): void {}

  update(dt: number): void {
    if (!this._active) {
      return;
    }

    const d: number = dt * this.timeScale;

    if (this._stateMachine) {
      this._stateMachine.update(d);
    }

    this.updateImpl(d);

    const childs = this.innerChilds;
    for (let i = 0; i < childs.length; ++i) {
      childs[i].update(d);
    }
  }

  draw(spriteBatch: SpriteBatch): void {
    if (!this.visible) {
      return;
    }

    const world: Matrix3 = this.worldTransform;

    const hasColor: boolean = !!this.color;

    if (this.blend) {
      spriteBatch.pushState(this.blend.data);
    }

    if (hasColor) {
      spriteBatch.pushState(this.color);
    }

    if (this._imageAdjust) {
      spriteBatch.pushState(this._imageAdjust);
    }

    if (this.mask) {
      Matrix3.Multiply(this.mask.localTransform, world, this.mask.worldTransform);
      spriteBatch.pushState(this.mask);
    }

    if (this.effect) {
      spriteBatch.pushState(this.effect);
    }

    if (this.rasterState) {
      spriteBatch.pushState(this.rasterState);
    }

    const sortedChilds = this.childs;

    let i = 0;
    let child: SceneObject;

    for (; i < sortedChilds.length; ++i) {
      child = sortedChilds[i];
      if (child.z >= 0) {
        break;
      }
      child.draw(spriteBatch);
    }

    this._drawImpl(spriteBatch, world);

    for (; i < sortedChilds.length; ++i) {
      const child = sortedChilds[i];
      child.draw(spriteBatch);
    }

    if (this.rasterState) {
      spriteBatch.popState(this.rasterState);
    }

    if (this.effect) {
      spriteBatch.popState(this.effect);
    }

    if (this.mask) {
      spriteBatch.popState(this.mask);
    }

    if (this._imageAdjust) {
      spriteBatch.popState(this._imageAdjust);
    }

    if (this.blend) {
      spriteBatch.popState(this.blend.data);
    }

    if (hasColor) {
      spriteBatch.popState(this.color);
    }
  }

  private _drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    if (DebugUtils.DrawSizes && this.size != Vector2.Zero) {
      PrimitivesRenderer.DrawRect(
        spriteBatch,
        Rect.fromSize(Vector2.Zero, this.size),
        transform,
        new Color4(1.0, 0.0, 0.0, 0.5)
      );
    }

    if (DebugUtils.DrawTouchAreas && this.touchArea) {
      PrimitivesRenderer.DrawRect(
        spriteBatch,
        this.touchArea,
        transform,
        new Color4(0.0, 0.0, 1.0, this.touchable ? 0.5 : 0.1)
      );
    }

    if (
      DebugUtils.DrawBounds &&
      (this.bounds || (this.id && this.size && this.id.toLowerCase().includes('bounds')))
    ) {
      const rect = this.bounds
        ? Rect.fromSize(this.bounds.lt, this.bounds.size)
        : Rect.fromSize(Vector2.Zero, this.size);
      PrimitivesRenderer.DrawRect(spriteBatch, rect, transform, new Color4(1.0, 0.0, 0.0, 0.5));
    }

    this.drawImpl(spriteBatch, transform);
  }

  updateImpl(_dt: number): void {}

  drawImpl(_spriteBatch: SpriteBatch, _transform: Matrix3): void {}

  findById<T extends SceneObject>(id: string): T | null {
    if (this.id === id) {
      return this as unknown as T;
    }

    for (let i = 0; i < this.innerChilds.length; ++i) {
      const child = this.innerChilds[i];
      const r = child.findById<T>(id);
      if (r) {
        return r;
      }
    }

    return null;
  }

  findAllByType<T extends SceneObject>(type: Constructor<T>): T[] {
    const result: T[] = [];
    this._findAllByType(type, result);
    return result;
  }

  findAllById<T extends SceneObject>(id: string): T[] {
    const result: T[] = [];
    this._findAllById(id, result);
    return result;
  }

  findAllByIdAndType<T extends SceneObject>(id: string, type: Constructor<T>): T[] {
    const result: T[] = [];
    this._findAllByIdAndType(id, type, result);
    return result;
  }

  private _findAllByIdAndType<T extends SceneObject>(
    id: string,
    type: Constructor<T>,
    result: T[]
  ): void {
    if (this instanceof type && this.id === id) {
      result.push(this);
    }

    for (let i = 0; i < this.innerChilds.length; ++i) {
      this.innerChilds[i]._findAllByIdAndType(id, type, result);
    }
  }

  private _findAllById(id: string, result: SceneObject[]): void {
    if (this.id === id) {
      result.push(this);
    }

    for (let i = 0; i < this.innerChilds.length; ++i) {
      this.innerChilds[i]._findAllById(id, result);
    }
  }

  private _findAllByType<T extends SceneObject>(type: Constructor<T>, result: SceneObject[]): void {
    if (this instanceof type) {
      result.push(this);
    }

    for (let i = 0; i < this.innerChilds.length; ++i) {
      this.innerChilds[i]._findAllByType(type, result);
    }
  }

  testEvent(_event: Event): boolean {
    return true;
  }

  isInPoint(vector: Vector2): boolean {
    const local = this.inverseTransform.transformVector(vector);
    return this.touchArea ? this.touchArea.test(local) : false;
  }

  dispatchEvent(event: CgsEvent): void {
    if (this.touchable) {
      if (event instanceof AbstractMouseEvent) {
        if (this.isInPoint(event.event.location)) {
          this.onTouch(event);
          this.doTouchEvent(event);
        }
      }
    }
  }

  onTouch(_event: AbstractMouseEvent): void {}

  doTouchEvent(e: AbstractMouseEvent): void {
    this._touchEventDispatcher.dispatchEvent(e);
  }

  disable(): void {
    this.active = this.visible = false;
  }

  enable(): void {
    this.active = this.visible = true;
  }

  private _notifyActiveChanged(active: boolean): void {
    // Fixed https://jira.allprojects.info/browse/SLTF-20925 (Inscription "Search for friends" is displayed in lobby)
    // When parent became active, all its descendants did receive activeChanged(true) notification, even when
    // some node between activated parent and this child was really hidden
    this.activeChanged(active && this._active);
    for (let i = 0; i < this.innerChilds.length; ++i) {
      this.innerChilds[i]._notifyActiveChanged(active && this._active);
    }
  }

  activeChanged(_active: boolean): void {}

  layoutImpl(_coordinateSystem: Rect): void {}

  layout(coordinateSystem: Rect): void {
    this.layoutImpl(coordinateSystem);

    for (let i = 0; i < this.innerChilds.length; ++i) {
      this.innerChilds[i].layout(coordinateSystem);
    }
  }

  removeAllChildsDisposing(): void {
    while (this.childs.length > 0) {
      const child = this.childs[0];
      this.removeChildDisposing(child);
    }
  }

  restartStateMachine(): void {
    if (this._stateMachine) this._stateMachine.restart();
    super.restartStateMachine();
  }

  dispose(): void {}

  removeChildDisposing(child: SceneObject): void {
    this.removeChild(child);
    child.traverseAll((disp) => {
      disp.deinitialize();
      disp.dispose();
    });
  }
}
