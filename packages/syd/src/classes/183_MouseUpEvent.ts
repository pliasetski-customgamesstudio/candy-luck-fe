import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class MouseUpEvent extends AbstractMouseEvent {
  upEvent: CGSMouseEvent;

  constructor(mouse: Mouse, event: CGSMouseEvent, upEvent: CGSMouseEvent) {
    super(mouse, event);
    this.upEvent = upEvent;
  }
}
