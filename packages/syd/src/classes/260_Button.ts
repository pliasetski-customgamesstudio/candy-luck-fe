import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { MouseCancelEvent } from './175_MouseCancelEvent';
import { MouseDownEvent } from './177_MouseDownEvent';
import { MouseMoveEvent } from './178_MouseMoveEvent';
import { MousePointerMoveEvent } from './181_MousePointerMoveEvent';
import { MouseUpEvent } from './183_MouseUpEvent';
import { ButtonBase } from './271_ButtonBase';
import { ButtonState } from './27_ButtonState';
import { EventDispatcher } from './78_EventDispatcher';
import { EventStream } from './22_EventStreamSubscription';
import { SceneObjectType } from './SceneObjectType';
import { Compatibility } from './16_Compatibility';

export class Button extends ButtonBase {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Button;
  }

  private _mouseEnteredDispatcher = new EventDispatcher<Button>();
  private _mouseLeftDispatcher = new EventDispatcher<Button>();

  get mouseEntered(): EventStream<Button> {
    return this._mouseEnteredDispatcher.eventStream;
  }

  get mouseLeft(): EventStream<Button> {
    return this._mouseLeftDispatcher.eventStream;
  }

  onTouch(e: AbstractMouseEvent): void {
    super.onTouch(e);

    if (e instanceof MouseDownEvent) {
      const inside = this.isInPoint(e.event.location);
      if (inside) {
        this.state = ButtonState.Down;
        e.accept();
      }
    } else if (e instanceof MouseCancelEvent) {
      this.state = ButtonState.Normal;
      e.accept();
    } else if (e instanceof MouseMoveEvent) {
      const inside = this.isInPoint(e.moveEvent.location);
      if (inside && this.state === ButtonState.Down) {
        this.state = ButtonState.Down;
        e.accept();
      } else {
        this.state = ButtonState.Normal;
      }
    } else if (e instanceof MousePointerMoveEvent) {
      const inside = this.isInPoint(e.event.location);
      if (inside && this.state === ButtonState.Normal) {
        this._mouseEnteredDispatcher.dispatchEvent(this);
        this.state = ButtonState.Hover;
      } else if (!inside && (this.state === ButtonState.Down || this.state === ButtonState.Hover)) {
        this._mouseLeftDispatcher.dispatchEvent(this);
        this.state = ButtonState.Normal;
      }
    } else if (e instanceof MouseUpEvent) {
      const inside = this.isInPoint(e.upEvent.location);
      if (this.state === ButtonState.Down) {
        this.state = (inside && !Compatibility.IsMobileBrowser)  ? ButtonState.Hover : ButtonState.Normal;
        this.dispatchClick();
      }
      e.accept();
    }
  }
}
