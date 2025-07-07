import { TapBehavior } from './140_TapBehavior';
import { Vector2 } from './15_Vector2';
import { DefaultTapBehavior, HAlignment, VAlignment } from './163_DefaultTapBehavior';
import { FrameUpdateScene } from './172_FrameUpdateScene';
import { MouseCancelEvent } from './175_MouseCancelEvent';
import { MouseMoveEvent } from './178_MouseMoveEvent';
import { MouseUpEvent } from './183_MouseUpEvent';
import { ScrollBehavior } from './142_ScrollBehavior';
import { BounceableScrollBehavior } from './199_BounceableScrollBehavior';
import { WheelDirection } from './206_MouseLongPressEvent';
import { SceneObject } from './288_SceneObject';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream, IStreamSubscription } from './22_EventStreamSubscription';
import { IScrollBar } from './135_IScrollBar';
import { Rect } from './112_Rect';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { MouseDownEvent } from './177_MouseDownEvent';
import { CgsEvent } from './12_Event';
import { CGSMouseEvent } from './37_MouseEvent';
import { MouseWheelEvent } from './197_MouseWheelEvent';
import { SceneObjectType } from './SceneObjectType';

export class ScrollSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Node;
  }

  private _scrollDispatcher: EventDispatcher<Vector2> = new EventDispatcher<Vector2>();

  public get scroll(): EventStream<Vector2> {
    return this._scrollDispatcher.eventStream;
  }

  private _prevTouch: CGSMouseEvent | null = null;
  private _tapBehavior: TapBehavior;
  private _scrollBehavior: ScrollBehavior;
  private _hBar: IScrollBar;
  private _vBar: IScrollBar;

  private _scrollBehaviorPositionSub: IStreamSubscription | null = null;
  private _scrollBehaviorFinishedSub: IStreamSubscription | null = null;
  private _tapBehaviorPointTouchSub: IStreamSubscription | null = null;
  private _tapBehaviorPointTouchUpSub: IStreamSubscription | null = null;

  private _contentView: SceneObject;
  public get contentView(): SceneObject {
    return this._contentView;
  }

  private _isScrolling: boolean = false;

  private static readonly moveThreshold: number = 225.0;
  private static readonly defaultWheelSensitivity: number = 1.1;
  private wheelSensitivity: number;

  public HAlignmentContent: HAlignment;
  public VAlignmentContent: VAlignment;

  constructor(contentSize: Vector2) {
    super();
    this.touchable = true;
    this.wheelSensitivity = ScrollSceneObject.defaultWheelSensitivity;

    this._contentView = new SceneObject();
    this._contentView.size = new Vector2(contentSize.x, contentSize.y);
    this.addChild(this.contentView);

    this.tapBehavior = new DefaultTapBehavior();
    const updater = new FrameUpdateScene();
    this.addChild(updater);
    this._scrollBehavior = new BounceableScrollBehavior(updater);

    this._tapBehavior.threshold = ScrollSceneObject.moveThreshold;
  }

  public initializeImpl(): void {
    super.initializeImpl();

    // TODO: trying to preserve non-nullability for Size and TouchArea, but may not work as desired
    // if (!this.size) {
    //   this.size = this.parent?.size?.clone();
    // }
    // if (!this.touchArea) {
    //   this.touchArea = this.size ? Rect.fromSize(Vector2.Zero.clone(), this.size) : null;
    // }
    if (this.size.equals(Vector2.Zero) && this.parent) {
      this.size = this.parent.size.clone();
    }
    if (this.touchArea.equals(Rect.Empty)) {
      this.touchArea = Rect.fromSize(Vector2.Zero.clone(), this.size);
    }

    this._updateScrollBarParams();
    this._initScrollBehavior();
  }

  public deinitializeImpl(): void {
    this._deinitScrollBehavior();
    super.deinitializeImpl();
  }

  public addContent(item: SceneObject): void {
    if (item) {
      this.contentView.addChild(item);
    }
  }

  public removeContent(item: SceneObject): void {
    if (item) {
      this.contentView.removeChild(item);
    }
  }

  public get contentSize(): Vector2 {
    return this.contentView.size;
  }

  public set contentSize(value: Vector2) {
    if (this.contentView.size != value) {
      this.contentView.size = value;
      this._updateAlignment();
      this._updateScrollBarParams();
      if (this._scrollBehavior) {
        this._scrollBehavior.setParams(this.size, this.contentView.size);
      }
    }
  }

  public get contentOffset(): Vector2 {
    return new Vector2(-this.contentView.position.x, -this.contentView.position.y);
  }

  public set contentOffset(value: Vector2) {
    this.contentView.position = new Vector2(-value.x, -value.y);
    this._updateScrollBars();
    this._scrollDispatcher.dispatchEvent(value);
  }

  private _setContentOffset(offset?: Vector2): void {
    this.contentOffset = offset!;
  }

  public get tapBehavior(): TapBehavior {
    return this._tapBehavior;
  }

  public set tapBehavior(value: TapBehavior) {
    this._tapBehaviorPointTouchSub?.cancel();
    this._tapBehaviorPointTouchUpSub?.cancel();
    this._tapBehavior = value;
    if (this._tapBehavior) {
      this._tapBehavior.pointTouch.listen((point) => this.onPointTouch(point));
      this._tapBehavior.pointTouchUp.listen((point) => this.onPointTouchUp(point));
    }
  }

  public onPointTouch(_point?: Vector2): void {}

  public onPointTouchUp(_point?: Vector2): void {}

  public processEvent(e: CgsEvent): void {
    super.processEvent(e);
    e.ignore();
  }

  public onTouch(event: AbstractMouseEvent): void {
    super.onTouch(event);

    if (this._scrollBehavior) {
      if (event instanceof MouseDownEvent) {
        this._prevTouch = event.event;
        this._scrollBehavior.down(this.contentView.position);
        this._isScrolling = false;
      } else if (event instanceof MouseMoveEvent) {
        if (this._prevTouch) {
          const dx: number = event.moveEvent.location.x - this._prevTouch.location.x;
          const dy: number = event.moveEvent.location.y - this._prevTouch.location.y;
          const dt: number = event.moveEvent.time - this._prevTouch.time;

          if (this.isInPoint(event.moveEvent.location)) {
            if (!this._isScrolling) {
              const point1: Vector2 = event.event.location;
              const point2: Vector2 = event.moveEvent.location;
              const v1: number = point1.x - point2.x,
                v2: number = point1.y - point2.y;
              this._isScrolling = v1 * v1 + v2 * v2 > ScrollSceneObject.moveThreshold;

              if (this._isScrolling) {
                this.contentView.dispatchEvent(new MouseCancelEvent(event.mouse, event.event));
                this.contentView.blockEvents = true;
                this._showScrollBars();
              }
            }
            this._scrollBehavior.move(this.contentView.position, dx, dy, dt);
            this._prevTouch = event.moveEvent;
          } else {
            this._scrollBehavior.up(this.contentView.position, dx, dy, dt);
            this._isScrolling = false;
            this._prevTouch = null;
            this.contentView.blockEvents = false;
          }
        }
      } else if (event instanceof MouseUpEvent) {
        if (this._prevTouch) {
          const dx: number = event.upEvent.location.x - this._prevTouch.location.x;
          const dy: number = event.upEvent.location.y - this._prevTouch.location.y;
          const dt: number = event.upEvent.time - this._prevTouch.time;
          this._scrollBehavior.up(this.contentView.position, dx, dy, dt);
          this._prevTouch = null;
          this._isScrolling = false;
          this.contentView.blockEvents = false;
        }
      } else if (event instanceof MouseWheelEvent) {
        if (this.isInPoint(event.event.location)) {
          this._prevTouch = null;
          this.contentView.sendEvent(new MouseCancelEvent(event.mouse, event.event));
          this._showScrollBars();
          let dy: number = -this.wheelSensitivity * event.wheelDelta;
          let dx: number = dy;
          if (event.direction == WheelDirection.Vertical) {
            if (this.size.y >= this.contentView.size.y) {
              dy = 0.0;
            } else {
              dx = 0.0;
            }
          } else if (event.direction == WheelDirection.Horizontal) {
            if (this.size.x >= this.contentView.size.x) {
              dx = 0.0;
            } else {
              dy = 0.0;
            }
          }

          this._scrollBehavior.wheel(this.contentView.position, dx, dy, 1.0);
        }
      } else if (event instanceof MouseCancelEvent) {
        if (this._prevTouch) {
          this._scrollBehavior.up(this.contentView.position, 0.0, 0.0, 0.0);
          this._prevTouch = null;
          this._isScrolling = false;
          this.contentView.blockEvents = false;
        }
      }
    }

    if (this._tapBehavior) {
      if (event instanceof MouseDownEvent) {
        const worldLocation: Vector2 = event.event.location.clone();
        //TODO: Vector2D localLocation = TransformWorldToLocal(worldLocation);
        this._tapBehavior.onDown(worldLocation);
      } else if (event instanceof MouseMoveEvent) {
        const worldBeginLocation: Vector2 = event.event.location.clone();
        const worldMoveLocation: Vector2 = event.moveEvent.location.clone();
        //TODO: world location
        this._tapBehavior.onMove(worldBeginLocation, worldMoveLocation);
      } else if (event instanceof MouseUpEvent) {
        const worldUpLocation: Vector2 = event.upEvent.location.clone();
        //TODO: world location
        this._tapBehavior.onUp(worldUpLocation);
      } else if (event instanceof MouseCancelEvent) {
        const worldLocation: Vector2 = event.event.location.clone();
        this._tapBehavior.onUp(worldLocation);
      }
    }

    event.accept();
  }

  public get scrollBehavior(): ScrollBehavior {
    return this._scrollBehavior;
  }

  public set scrollBehavior(value: ScrollBehavior) {
    this._deinitScrollBehavior();
    this._scrollBehavior = value;
    if (this.isInitialized) {
      this._initScrollBehavior();
    }
  }

  private _deinitScrollBehavior(): void {
    if (this._scrollBehaviorPositionSub) {
      this._scrollBehaviorPositionSub.cancel();
      this._scrollBehaviorPositionSub = null;
    }
    if (this._scrollBehaviorFinishedSub) {
      this._scrollBehaviorFinishedSub.cancel();
      this._scrollBehaviorFinishedSub = null;
    }
  }

  private _initScrollBehavior(): void {
    if (this._scrollBehavior) {
      this._scrollBehavior.setParams(this.size, this.contentView.size);
      this._scrollBehaviorPositionSub = this._scrollBehavior.changePosition.listen(() =>
        this._setContentOffset()
      );
      this._scrollBehaviorFinishedSub = this._scrollBehavior.scrollFinished.listen(() =>
        this._onScrollFinished()
      );
    }
  }

  private _onScrollFinished(): void {
    this.contentView.position = new Vector2(
      this.contentView.position.x,
      this.contentView.position.y
    );
    this._hideScrollBars();
  }

  public get horizontalBar(): IScrollBar {
    return this._hBar;
  }

  public set horizontalBar(value: IScrollBar) {
    this._hBar = value;
    if (this.isInitialized) {
      this._updateScrollBarParams();
    }
  }

  public get verticalBar(): IScrollBar {
    return this._vBar;
  }

  public set verticalBar(value: IScrollBar) {
    this._vBar = value;
    if (this.isInitialized) {
      this._updateScrollBarParams();
    }
  }

  private _updateScrollBars(): void {
    this._hBar?.updatePosition(this.contentView.position);
    this._vBar?.updatePosition(this.contentView.position);
  }

  private _showScrollBars(): void {
    this._hBar?.show();
    this._vBar?.show();
  }

  private _hideScrollBars(): void {
    this._hBar?.hide();
    this._vBar?.hide();
  }

  private _updateScrollBarParams(): void {
    if (this._hBar) {
      this._hBar.updateSize(this.size, this.contentView.size);
      this._hBar.updatePosition(this.contentView.position);
    }
    if (this._vBar) {
      this._vBar.updateSize(this.size, this.contentView.size);
      this._vBar.updatePosition(this.contentView.position);
    }
  }

  private _updateAlignment(): void {
    let needUpdate: boolean = false;
    const offset: Vector2 = this.contentOffset;
    if (this.size.y > this.contentView.size.y) {
      needUpdate = true;
      switch (this.VAlignmentContent) {
        case VAlignment.Bottom:
          offset.y = -(this.size.y - this.contentView.size.y);
          break;
        case VAlignment.Center:
          offset.y = -(this.size.y - this.contentView.size.y) / 2;
          break;
        default:
          offset.y = 0.0;
          break;
      }
      if (this.size.x > this.contentView.size.x) {
        needUpdate = true;
        switch (this.HAlignmentContent) {
          case HAlignment.Right:
            offset.x = -(this.size.x - this.contentView.size.x);
            break;
          case HAlignment.Center:
            offset.x = -(this.size.x - this.contentView.size.x) / 2;
            break;
          default:
            offset.x = 0.0;
            break;
        }
      }
      if (needUpdate) {
        this.contentOffset = offset;
      }
    }
  }
}
