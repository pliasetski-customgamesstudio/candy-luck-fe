import { Color4 } from './10_Color4';
import { InterpolateCopyAction } from './130_InterpolateCopyAction';
import { ActionActivator } from './155_ActionActivator';
import { Vector2 } from './15_Vector2';
import { IFramePulse } from './20_IFramePulse';
import { SceneObject } from './288_SceneObject';
import { EventDispatcher } from './78_EventDispatcher';
import { Action } from './84_Action';
import { IScrollBar } from './135_IScrollBar';
import { EventStream, IStreamSubscription } from './22_EventStreamSubscription';
import { Effect } from './89_Effect';

export abstract class AbstractScrollBarSceneObject
  extends SceneObject
  implements IScrollBar, IFramePulse
{
  private _activator: ActionActivator;
  private readonly _direction: ScrollDirection;
  private _hideAction: Action;
  private _viewPortSize: Vector2;
  private _contentSize: Vector2;

  static defaultHideAnimDuration: number = 0.3;

  private _updateDispatcher: EventDispatcher<number> = new EventDispatcher<number>();
  private _actionDoneSub: IStreamSubscription;

  constructor(direction: ScrollDirection) {
    super();
    this._direction = direction;
    this._activator = new ActionActivator(this);
    this._hideAction = this.createDefaultHideAnimation(
      this,
      AbstractScrollBarSceneObject.defaultHideAnimDuration
    );
    this.effect = Effect.Color;
  }

  style: ScrollBarStyle;

  private _setInvisible(): void {
    this.visible = false;
  }

  get framePulsate(): EventStream<number> {
    return this._updateDispatcher.eventStream;
  }

  get direction(): ScrollDirection {
    return this._direction;
  }

  get hideAction(): Action {
    return this._hideAction;
  }

  set hideAction(value: Action) {
    if (this._actionDoneSub) {
      this._actionDoneSub.cancel();
    }
    this._hideAction = value;
    if (this._hideAction) {
      this._actionDoneSub = this._hideAction.done.listen(() => this._setInvisible());
    }
  }

  initializeImpl(): void {
    super.initializeImpl();

    // TODO: trying to preserve non-nullability for Size, but may not work as desired
    // if (!this.size) {
    //   this.size = this.parent?.size?.clone();
    // }
    if (this.size.equals(Vector2.Zero) && this.parent) {
      this.size = this.parent.size.clone();
    }

    this.visible = this.style === ScrollBarStyle.AlwaysVisible;
  }

  show(): void {
    if (this.style === ScrollBarStyle.Auto && this.hasScrollingContent()) {
      if (this._activator.action && this._activator.action.isDone) {
        this._activator.end();
        this._activator.action = null;
      }
      this.visible = true;
    }
  }

  hide(): void {
    if (this.style === ScrollBarStyle.Auto) {
      if (this.hideAction) {
        this._activator.action = this.hideAction;
        this._activator.start();
      } else {
        this.visible = false;
      }
    }
  }

  updateSize(viewPortSize: Vector2, contentSize: Vector2): void {
    this._viewPortSize = viewPortSize;
    this._contentSize = contentSize;

    this.updateScrollBarParams(this.parent!.size, contentSize, viewPortSize);
    if (this.style === ScrollBarStyle.DependsContent) {
      this.visible = this.hasScrollingContent();
    }
  }

  updateImpl(dt: number): void {
    this._updateDispatcher.dispatchEvent(dt);
    super.updateImpl(dt);
  }

  abstract updatePosition(contentPosition: Vector2): void;

  abstract updateScrollBarParams(
    scrollSliderSize: Vector2,
    contentSize: Vector2,
    viewPortSize: Vector2
  ): void;

  private _update(): void {
    this.updateScrollBarParams(this.parent!.size, this._contentSize, this._viewPortSize);
  }

  private hasScrollingContent(): boolean {
    const isHorizontal: boolean = this._direction === ScrollDirection.Horizontal;
    const scrSize: number = isHorizontal ? this._viewPortSize.x : this._viewPortSize.y;
    const cntSize: number = isHorizontal ? this._contentSize.x : this._contentSize.y;
    return cntSize > scrSize;
  }

  private createDefaultHideAnimation(
    node: SceneObject,
    duration: number
  ): InterpolateCopyAction<Color4> {
    const white: Color4 = Color4.White.clone();
    const action: InterpolateCopyAction<Color4> = new InterpolateCopyAction<Color4>()
      .withValues(white, new Color4(white.r, white.g, white.b, 0.0))
      .withInterpolateFunction(Color4.Lerp)
      .withDuration(duration);
    action.valueChange.listen((v?) => {
      node.color = v!;
    });
    action.done.listen(() => {
      node.color = white!;
    });
    return action;
  }
}

export enum ScrollDirection {
  Horizontal,
  Vertical,
}

export enum ScrollBarStyle {
  Auto,
  DependsContent,
  AlwaysVisible,
  Hidden,
}
