import { Button, SceneObject } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { ChangeBetButtonsController } from '../controllers/change_bet_buttons_controller';

export class ChangeBetButtonsView extends BaseSlotView<ChangeBetButtonsController> {
  private _decreaseButtons: Button[];
  private _increaseButtons: Button[];

  constructor(root: SceneObject) {
    super(root);
    this._decreaseButtons = root.findAllById<Button>('ValueBetDown');
    this._increaseButtons = root.findAllById<Button>('ValueBetUp');

    if (this._decreaseButtons && this._decreaseButtons.length > 0) {
      this._decreaseButtons.forEach((b) =>
        b.clicked.listen(() => this.controller.decreaseButtonClicked())
      );
    }
    if (this._increaseButtons && this._increaseButtons.length > 0) {
      this._increaseButtons.forEach((b) =>
        b.clicked.listen(() => this.controller.increaseButtonClicked())
      );
    }
  }

  enableIncreaseButton(extraBet: boolean): void {
    const stateName = 'up';
    if (this._increaseButtons && this._increaseButtons.length > 0) {
      this._increaseButtons.forEach((b) => {
        b.stateMachine!.switchToState(stateName);
        b.touchable = true;
      });
    }
  }

  enableDecreaseButton(maxBet: boolean): void {
    const stateName = 'up';
    if (this._decreaseButtons && this._decreaseButtons.length > 0) {
      this._decreaseButtons.forEach((b) => {
        b.stateMachine!.switchToState(stateName);
        b.touchable = true;
      });
    }
  }

  disableIncreaseButton(extraBet: boolean): void {
    const stateName = 'dis';
    if (this._increaseButtons && this._increaseButtons.length > 0) {
      this._increaseButtons.forEach((b) => {
        b.stateMachine!.switchToState(stateName);
        b.touchable = false;
      });
    }
  }

  disableDecreaseButton(extraBet: boolean = false): void {
    const stateName = 'dis';
    if (this._decreaseButtons && this._decreaseButtons.length > 0) {
      this._decreaseButtons.forEach((b) => {
        b.stateMachine!.switchToState(stateName);
        b.touchable = false;
      });
    }
  }
}
