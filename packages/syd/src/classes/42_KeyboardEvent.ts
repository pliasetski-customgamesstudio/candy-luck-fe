import { CgsEvent } from './12_Event';

export class CGSKeyboardEvent extends CgsEvent {
  keyCode: number;
  charCode: number;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;

  constructor(
    keyCode: number,
    charCode: number,
    ctrlKey: boolean,
    altKey: boolean,
    shiftKey: boolean
  ) {
    super();
    this.keyCode = keyCode;
    this.charCode = charCode;
    this.ctrlKey = ctrlKey;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
  }
}
