import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class MousePointerMoveEvent extends AbstractMouseEvent {
  constructor(mouse: Mouse, event: CGSMouseEvent) {
    super(mouse, event);
  }
}
