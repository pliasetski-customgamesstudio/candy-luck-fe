import { RoundComponentBase } from './round_component_base';
import { ButtonBase, CheckBox } from '@cgs/syd';
import { RoundMessage } from '../messaging/round_message';

export class ShareComponent extends RoundComponentBase {
  private readonly _shareCheckbox: CheckBox[];

  constructor(btn: ButtonBase[]) {
    super(btn);
    this._shareCheckbox = btn as CheckBox[];
  }

  get isShare(): boolean {
    return this._shareCheckbox[0].checked;
  }

  get source(): ButtonBase[] {
    return this._shareCheckbox;
  }

  proceedMessage(_message: RoundMessage): void {}

  init(): void {
    if (this._shareCheckbox) {
      this._shareCheckbox[0].touchable = true;
    }
  }

  deinit(): void {
    if (this._shareCheckbox) {
      this._shareCheckbox[0].touchable = false;
    }
  }

  dispose(): void {}
}
