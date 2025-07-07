import { ButtonBase } from './271_ButtonBase';
import { ButtonState } from './27_ButtonState';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { MouseDownEvent } from './177_MouseDownEvent';
import { MouseUpEvent } from './183_MouseUpEvent';
import { SceneObjectType } from './SceneObjectType';
import { MousePointerMoveEvent } from './181_MousePointerMoveEvent';

export class CheckBox extends ButtonBase {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.Checkbox;
  }

  private _checked: boolean = false;

  get upState(): ButtonState {
    return this._checked ? ButtonState.Down : ButtonState.Normal;
  }

  get downState(): ButtonState {
    return this._checked ? ButtonState.Down : ButtonState.Normal;
  }

  get state(): ButtonState {
    return super.state;
  }

  set state(value: ButtonState) {
    this.checked = value === ButtonState.Down;
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = value;
    super.state = this._checked ? ButtonState.Down : ButtonState.Normal;
  }

  onTouch(mouseEvent: AbstractMouseEvent): void {
    super.onTouch(mouseEvent);
    if (mouseEvent instanceof MouseDownEvent) {
      mouseEvent.accept();
    }
    if (mouseEvent instanceof MouseUpEvent) {
      if (this.isInPoint(mouseEvent.upEvent.location)) {
        this.checked = !this.checked;
        this.dispatchClick();
      }
      mouseEvent.accept();
    }
    if (mouseEvent instanceof MousePointerMoveEvent) {
      const inside = this.isInPoint(mouseEvent.event.location);
      if (inside && this.state === ButtonState.Normal) {
        super.state = ButtonState.Hover;
      } else if (!inside && this.state === ButtonState.Hover) {
        super.state = ButtonState.Normal;
      }
    }
  }
}
