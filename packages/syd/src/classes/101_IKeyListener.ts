import { CGSKeyboardEvent } from './42_KeyboardEvent';

export interface IKeyListener {
  onKeyUp(event: CGSKeyboardEvent): void;

  onKeyDown(event: CGSKeyboardEvent): void;

  onKeyPress(event: CGSKeyboardEvent): void;
}
