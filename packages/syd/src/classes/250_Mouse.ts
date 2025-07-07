import { CGSMouseEvent } from './37_MouseEvent';
import { Timer } from './Timer';
import { EventDispatcher } from './78_EventDispatcher';
import { Tuple } from './0_Tuple';
import { Tuple3 } from './17_Tuple3';
import { WheelDirection } from './206_MouseLongPressEvent';
import { Compatibility } from './16_Compatibility';
import { Vector2 } from './15_Vector2';

export class Mouse {
  _canvas: HTMLCanvasElement;
  _downEvent: CGSMouseEvent | null = null;
  _touchStartEvent: TouchEvent | null = null;
  _touchLastMove: TouchEvent | null = null;
  _startTouchTime: Date | null = null;
  _squareDistance = 0.0;
  _timer: Timer | null = null;
  _touchTimer: Timer | null = null;
  static defaultLongTapDuration = 750;
  static defaultLongThreshold = 200.0;
  _capture = false;
  _onDown = new EventDispatcher<CGSMouseEvent>();
  _onMove = new EventDispatcher<Tuple<CGSMouseEvent, CGSMouseEvent>>();
  _onPointerMove = new EventDispatcher<CGSMouseEvent>();
  _onUp = new EventDispatcher<Tuple<CGSMouseEvent, CGSMouseEvent>>();
  _onWheel = new EventDispatcher<Tuple3<CGSMouseEvent, WheelDirection, number>>();
  _onLongPress = new EventDispatcher<CGSMouseEvent>();

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
    this._canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
    this._canvas.addEventListener('mousemove', this._onMousePointerMove.bind(this));
    // this._canvas.addEventListener('wheel', this._onMouseWheel.bind(this));
    this._canvas.addEventListener('mouseleave', this._onMouseLeave.bind(this));
    this._canvas.addEventListener('touchstart', this._onTouchStart.bind(this));
    this._canvas.addEventListener('touchend', this._onTouchEnd.bind(this));
    // touch leave was removed from spec https://www.w3.org/TR/touch-events/#list-of-touchevent-types
    // this._canvas.addEventListener('touchleave', this._onTouchLeave.bind(this));
    this._canvas.addEventListener('touchmove', this._onTouchMove.bind(this));
    this._canvas.addEventListener('touchcancel', this._onTouchCancel.bind(this));
  }

  get onDown() {
    return this._onDown.eventStream;
  }

  get onMove() {
    return this._onMove.eventStream;
  }

  get onPointerMove() {
    return this._onPointerMove.eventStream;
  }

  get onUp() {
    return this._onUp.eventStream;
  }

  get onWheel() {
    return this._onWheel.eventStream;
  }

  get onLongPress() {
    return this._onLongPress.eventStream;
  }

  _getTime() {
    return new Date().getTime();
  }

  setCursor(cursor: string) {
    this._canvas.style.cursor = cursor;
  }

  beginCapture() {
    try {
      this._capture = true;
      this._canvas.requestPointerLock();
    } catch {
      //
    }
  }

  endCapture() {
    try {
      this._capture = false;
      document.exitPointerLock();
    } catch {
      //
    }
  }

  _getCanvasOffset() {
    let element: HTMLElement = this._canvas;
    let top = 0.0;
    let left = 0.0;

    do {
      top += element.offsetTop ?? 0.0;
      left += element.offsetLeft ?? 0.0;
      element = element.offsetParent as HTMLElement;
    } while (element);

    const isMobile = Compatibility.IsMobileBrowser;
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isMobile && isPortrait) {
      left -= this._canvas.clientHeight;
    }

    return new Vector2(left, top);
  }

  _getPosition(event: MouseEvent) {
    return this._getPositionInner(event.clientX, event.clientY);
  }

  _getPositionInner(clientX: number, clientY: number) {
    function parseIntWithDefault(value: string, defaultValue: number): number {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    const rect = this._canvas.getBoundingClientRect();
    const resX = clientX - rect.left;
    const resY = clientY - rect.top;

    const styling = getComputedStyle(this._canvas);

    const leftBorder = parseIntWithDefault(
      styling.getPropertyValue('border-left-width').replace('px', '').trim(),
      5
    );
    const topBorder = parseIntWithDefault(
      styling.getPropertyValue('border-top-width').replace('px', '').trim(),
      5
    );

    const sx = this._canvas.width / this._canvas.clientWidth;
    const sy = this._canvas.height / this._canvas.clientHeight;

    return new Vector2((resX - leftBorder) * sx, (resY - topBorder) * sy);
  }

  _getPositionFromTouch(event: TouchEvent) {
    return this._getPositionInner(event.touches[0].clientX, event.touches[0].clientY);
  }

  cloneMouseEvent(mouseEvent: CGSMouseEvent): CGSMouseEvent {
    return new CGSMouseEvent(mouseEvent.location.clone(), mouseEvent.time);
  }

  _onTouchStart(event: TouchEvent) {
    if (!(event instanceof TouchEvent)) {
      console.log('Wrong Mouse event type');
      return;
    }

    if (!event.touches || event.touches.length != 1) {
      this._startTouchTime = null;
      this._touchStartEvent = null;
      this._touchLastMove = null;
      return;
    }

    this._startTouchTime = new Date();
    this._touchStartEvent = event;
    this._touchLastMove = event;

    const startLocation = this._getPositionFromTouch(event);

    this._onDown.dispatchEvent(new CGSMouseEvent(startLocation, this._getTime()));
    this._touchTimer = new Timer(Mouse.defaultLongTapDuration, () => this._touchTimerCallback());

    event.preventDefault();
  }

  _onTouchCancel(_event: TouchEvent) {
    this._startTouchTime = null;
    this._touchStartEvent = null;
    this._touchLastMove = null;
  }

  _onTouchMove(event: TouchEvent) {
    if (!(event instanceof TouchEvent)) {
      console.log('Wrong Mouse event type');
      return;
    }

    if (this._touchStartEvent) {
      const startLocation = this._getPositionFromTouch(this._touchStartEvent);
      const currentLocation =
        event.touches.length == 1 ? this._getPositionFromTouch(event) : startLocation;
      this._touchLastMove = event;
      this._onMove.dispatchEvent(
        new Tuple(
          new CGSMouseEvent(startLocation, this._getTime()),
          new CGSMouseEvent(currentLocation, this._getTime())
        )
      );
    }
  }

  _onTouchEnd(event: TouchEvent) {
    if (!(event instanceof TouchEvent)) {
      console.log('Wrong Mouse event type');
      return;
    }

    if (this._touchStartEvent && this._touchLastMove) {
      const startLocation = this._getPositionFromTouch(this._touchStartEvent);
      const endLocation =
        this._touchLastMove.touches.length == 1
          ? this._getPositionFromTouch(this._touchLastMove)
          : startLocation;
      this._onUp.dispatchEvent(
        new Tuple(
          new CGSMouseEvent(startLocation, this._getTime()),
          new CGSMouseEvent(endLocation, this._getTime())
        )
      );
      this._touchStartEvent = null;
      this._touchLastMove = null;
      this._cancelTouchTimer();

      event.preventDefault();
    }
  }

  _onTouchLeave(_event: TouchEvent) {
    this._cancelTouchTimer();
    this._startTouchTime = null;
    this._touchStartEvent = null;
    this._touchLastMove = null;
  }

  _cancelTouchTimer() {
    if (this._touchTimer) {
      this._touchTimer.cancel();
      this._touchTimer = null;
    }
  }

  _touchTimerCallback() {
    if (this._touchStartEvent) {
      this._onLongPress.dispatchEvent(
        new CGSMouseEvent(this._getPositionFromTouch(this._touchStartEvent), this._getTime())
      );
    }
  }

  _onMouseDown(event: MouseEvent) {
    const downEvent = new CGSMouseEvent(this._getPosition(event), this._getTime());
    this._downEvent = downEvent;
    this._onDown.dispatchEvent(this.cloneMouseEvent(downEvent));
    this._timer = new Timer(Mouse.defaultLongTapDuration, () => this._timerCallback());

    event.preventDefault();
  }

  _timerCallback() {
    if (this._downEvent && this._squareDistance < Mouse.defaultLongThreshold) {
      this._onLongPress.dispatchEvent(this.cloneMouseEvent(this._downEvent));
    }
  }

  _onMouseUp(event: MouseEvent) {
    if (this._downEvent) {
      this._onUp.dispatchEvent(
        new Tuple(
          this.cloneMouseEvent(this._downEvent),
          new CGSMouseEvent(this._getPosition(event), this._getTime())
        )
      );
      this._downEvent = null;

      this._squareDistance = 0.0;
      if (this._timer) {
        this._timer.cancel();
        this._timer = null;
      }
    }

    event.preventDefault();
  }

  _onMousePointerMove(event: MouseEvent) {
    const location =
      document.pointerLockElement !== this._canvas
        ? this._getPosition(event)
        : new Vector2(event.movementX, event.movementY);
    const time = this._getTime();
    this._onPointerMove.dispatchEvent(new CGSMouseEvent(location.clone(), time));
    if (this._downEvent) {
      this._onMove.dispatchEvent(
        new Tuple(this.cloneMouseEvent(this._downEvent), new CGSMouseEvent(location.clone(), time))
      );

      const dx = this._downEvent.location.x - location.x;
      const dy = this._downEvent.location.y - location.y;
      const d = dx * dx + dy * dy;
      if (d > this._squareDistance) {
        this._squareDistance = d;
      }
    }
    event.preventDefault();
  }

  _onMouseLeave(event: MouseEvent) {
    if (this._downEvent) {
      if (!this._capture) {
        this._onUp.dispatchEvent(
          new Tuple(
            this.cloneMouseEvent(this._downEvent),
            new CGSMouseEvent(this._getPosition(event), this._getTime())
          )
        );
        this._downEvent = null;
      }
    }

    event.preventDefault();
  }

  _onMouseWheel(event: WheelEvent) {
    let direction: WheelDirection;
    let delta: number;
    if (event.deltaX != 0) {
      direction = WheelDirection.Horizontal;
      delta = event.deltaX;
    } else {
      direction = WheelDirection.Vertical;
      delta = event.deltaY;
    }
    this._onWheel.dispatchEvent(
      new Tuple3(new CGSMouseEvent(this._getPosition(event), this._getTime()), direction, delta)
    );

    event.preventDefault();
  }
}
