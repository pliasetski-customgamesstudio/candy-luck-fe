import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { Mouse } from './250_Mouse';
import { CGSMouseEvent } from './37_MouseEvent';

export class MouseLongPressEvent extends AbstractMouseEvent {
  constructor(mouse: Mouse, event: CGSMouseEvent) {
    super(mouse, event);
  }
}

export enum SwipeDirection {
  left,
  right,
  up,
  down,
  unknown,
}

export enum WheelDirection {
  Horizontal,
  Vertical,
}
