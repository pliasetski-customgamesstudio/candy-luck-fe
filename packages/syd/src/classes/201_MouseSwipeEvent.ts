import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { SwipeDirection } from './206_MouseLongPressEvent';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class MouseSwipeEvent extends AbstractMouseEvent {
  direction: SwipeDirection;

  constructor(mouse: Mouse, event: CGSMouseEvent, direction: SwipeDirection) {
    super(mouse, event);
    this.direction = direction;
  }
}
