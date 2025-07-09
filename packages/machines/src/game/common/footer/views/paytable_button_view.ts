import { BuildMode } from '@cgs/shared';
import { Button, SceneObject, DebugConsole } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { PaytableButtonController } from '../controllers/paytable_button_controller';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

export class PaytableButtonView extends BaseSlotView<PaytableButtonController> {
  private readonly _paytableButtons: Button[];
  private readonly _dropDownButtons: Button[];
  private readonly _clickSound: SoundInstance;

  constructor(parent: SceneObject, clickSound: SoundInstance) {
    super(parent);

    this._clickSound = clickSound;

    this._paytableButtons = parent.findAllById<Button>('PayTableBtn');
    this._dropDownButtons = parent.findAllById<Button>('dropDownBtn');

    this._paytableButtons.forEach((b) => {
      b.clicked.listen(() => this.onButtonClick());
      b.longPressed.listen(() => this.onLongPressed());
    });
  }

  disableButton() {
    if (this._paytableButtons && this._paytableButtons.length > 0) {
      this._paytableButtons.forEach((b) => {
        b.stateMachine!.switchToState('dis');
        b.touchable = false;
      });
    }
  }

  enableButton() {
    if (this._paytableButtons && this._paytableButtons.length > 0) {
      this._paytableButtons.forEach((b) => {
        b.stateMachine!.switchToState('up');
        b.touchable = true;
      });
    }
  }

  onButtonClick(): void {
    this.controller.buttonClicked();
    this._clickSound.stop();
    this._clickSound.play();
  }

  onLongPressed() {
    if (BuildMode.isDebug) {
      DebugConsole.Enable();
    }
  }
}
