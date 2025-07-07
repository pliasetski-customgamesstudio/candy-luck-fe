import { Mouse } from './250_Mouse';
import { Keyboard } from './217_Keyboard';

export class InputSystem {
  readonly mouse: Mouse;
  readonly keyboard: Keyboard;

  constructor(mouse: Mouse, keyboard: Keyboard) {
    this.mouse = mouse;
    this.keyboard = keyboard;
  }
}
