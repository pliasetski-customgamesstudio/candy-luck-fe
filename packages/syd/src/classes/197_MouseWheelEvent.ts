import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { WheelDirection } from './206_MouseLongPressEvent';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class MouseWheelEvent extends AbstractMouseEvent {
  wheelDelta: number;
  direction: WheelDirection;

  constructor(mouse: Mouse, event: CGSMouseEvent, direction: WheelDirection, wheelDelta: number) {
    super(mouse, event);
    this.direction = direction;
    this.wheelDelta = wheelDelta;
  }
}
