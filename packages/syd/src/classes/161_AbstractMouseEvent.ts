import { CgsEvent } from './12_Event';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class AbstractMouseEvent extends CgsEvent {
  mouse: Mouse;
  event: CGSMouseEvent;

  constructor(mouse: Mouse, event: CGSMouseEvent) {
    super();
    this.mouse = mouse;
    this.event = event;
  }
}
