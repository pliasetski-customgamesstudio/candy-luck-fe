import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class MouseMoveEvent extends AbstractMouseEvent {
  moveEvent: CGSMouseEvent;

  constructor(mouse: Mouse, event: CGSMouseEvent, moveEvent: CGSMouseEvent) {
    super(mouse, event);
    this.moveEvent = moveEvent;
  }
}
