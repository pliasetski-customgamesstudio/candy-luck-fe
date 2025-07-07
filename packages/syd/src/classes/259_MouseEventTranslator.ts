import { Mouse } from './250_Mouse';
import { MouseEventHandler } from './286_TtfTextInputSceneObject';
import { Matrix3 } from './57_Matrix3';
import { MouseMoveEvent } from './178_MouseMoveEvent';
import { MousePointerMoveEvent } from './181_MousePointerMoveEvent';
import { Vector2 } from './15_Vector2';
import { MouseLongPressEvent } from './206_MouseLongPressEvent';
import { MouseWheelEvent } from './197_MouseWheelEvent';
import { MouseUpEvent } from './183_MouseUpEvent';
import { MouseDownEvent } from './177_MouseDownEvent';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';

export class MouseEventTranslator {
  private _handler: MouseEventHandler;
  private _transform: Matrix3;

  public setTransform(transform: Matrix3): void {
    this._transform = transform;
  }

  public subscribe(handler: MouseEventHandler): void {
    this._handler = handler;
  }

  constructor(mouse: Mouse) {
    mouse.onMove.listen((p) => {
      if (p) {
        this._applyTransform(p.item1.location);
        this._applyTransform(p.item2.location);
        this._dispatchEvent(new MouseMoveEvent(mouse, p.item1, p.item2));
      }
    });
    mouse.onPointerMove.listen((p) => {
      if (p) {
        this._applyTransform(p.location);
        this._dispatchEvent(new MousePointerMoveEvent(mouse, p));
      }
    });

    mouse.onDown.listen((p) => {
      if (p) {
        this._applyTransform(p.location);
        this._dispatchEvent(new MouseDownEvent(mouse, p));
      }
    });

    mouse.onUp.listen((p) => {
      if (p) {
        this._applyTransform(p.item1.location);
        this._applyTransform(p.item2.location);
        this._dispatchEvent(new MouseUpEvent(mouse, p.item1, p.item2));
      }
    });

    mouse.onWheel.listen((p) => {
      if (p) {
        this._applyTransform(p.item1.location);
        this._dispatchEvent(new MouseWheelEvent(mouse, p.item1, p.item2, p.item3));
      }
    });

    mouse.onLongPress.listen((p) => {
      if (p) {
        this._applyTransform(p.location);
        this._dispatchEvent(new MouseLongPressEvent(mouse, p));
      }
    });
  }

  private _applyTransform(p: Vector2): Vector2 {
    if (this._transform) {
      this._transform.transformVectorInplace(p);
    }
    return p;
  }

  private _dispatchEvent(event: AbstractMouseEvent): void {
    if (this._handler) {
      this._handler(event);
    }
  }
}
