import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { SceneObject } from './288_SceneObject';
import { MouseCursor } from './45_MouseCursor';
import { ButtonState } from './27_ButtonState';
import { CgsEvent } from './12_Event';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { MouseDownEvent } from './177_MouseDownEvent';
import { MousePointerMoveEvent } from './181_MousePointerMoveEvent';
import { MouseUpEvent } from './183_MouseUpEvent';
import { MouseCancelEvent } from './175_MouseCancelEvent';
import { MouseLongPressEvent } from './206_MouseLongPressEvent';
import { Compatibility } from './16_Compatibility';

export abstract class ButtonBase extends SceneObject {
  cursor: MouseCursor;
  private _capture: boolean = false;
  private _state: ButtonState;
  get state(): ButtonState {
    return this._state;
  }

  set state(value: ButtonState) {
    this._state = value;
  }

  private _clickedDispatcher: EventDispatcher<ButtonBase> = new EventDispatcher<ButtonBase>();

  get clicked(): EventStream<ButtonBase> {
    return this._clickedDispatcher.eventStream;
  }

  dispatchClick(): void {
    this._clickedDispatcher.dispatchEvent(this);
  }

  private _longPressedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();

  get longPressed(): EventStream<void> {
    return this._longPressedDispatcher.eventStream;
  }

  constructor() {
    super();
    this._state = ButtonState.Normal;
    this.touchable = true;
  }

  dispatchEvent(e: CgsEvent): void {
    if (Compatibility.IsMobileBrowser) {
      this._dispatchMobileEvent(e);
    } else {
      this._dispatchDesktopEvent(e);
    }
  }

  _dispatchDesktopEvent(e: CgsEvent): void {
    if ((this.touchable || this._capture) && e instanceof AbstractMouseEvent) {
      const inside: boolean = this.isInPoint(e.event.location);
      if (e instanceof MouseDownEvent || e instanceof MousePointerMoveEvent) {
        if (inside) {
          this._capture = true;
        }
      }

      if (this._capture) {
        const c: MouseCursor = !this.cursor
          ? inside
            ? MouseCursor.Pointer
            : MouseCursor.Arrow
          : this.cursor;
        e.mouse.setCursor(c);

        if (this.touchable) {
          this.onTouch(e);
        }

        if (e instanceof MouseCancelEvent || (e instanceof MousePointerMoveEvent && !inside)) {
          this._capture = false;
        }
      }

      if (this.touchable && inside) {
        this.doTouchEvent(e);
      }
    }
  }

  _dispatchMobileEvent(e: CgsEvent): void {
    if (this.touchable && e instanceof AbstractMouseEvent) {
      const inside: boolean = this.isInPoint(e.event.location);
      if (e instanceof MouseDownEvent || e instanceof MousePointerMoveEvent) {
        if (inside) {
          this._capture = true;
        }
      }

      if (this._capture) {
        const c: MouseCursor = !this.cursor
          ? inside
            ? MouseCursor.Pointer
            : MouseCursor.Arrow
          : this.cursor;
        e.mouse.setCursor(c);
        this.onTouch(e);
        if (
          e instanceof MouseUpEvent ||
          e instanceof MouseCancelEvent ||
          (e instanceof MousePointerMoveEvent && !inside)
        ) {
          this._capture = false;
        }
      }

      if (inside) {
        this.doTouchEvent(e);
      }
    }
  }

  onTouch(e: AbstractMouseEvent): void {
    super.onTouch(e);
    if (e instanceof MouseLongPressEvent) {
      this._longPressedDispatcher.dispatchEvent();
    }
  }
}
