import { SceneObject, Button } from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { GambleButtonController } from '../controllers/gamble_button_controller';

export class GambleButtonView extends BaseSlotView<GambleButtonController> {
  private _gambleNode: SceneObject;
  private _gambleButton: Button;

  constructor(parent: SceneObject) {
    super(parent);
    this._gambleNode = parent.findById('gamble') as SceneObject;
    this._gambleButton = parent.findById('gambleBtn') as Button;
    this._gambleButton.clicked.listen(() => this._gambleButtonClicked());
  }

  private _gambleButtonClicked(): void {
    this.controller.onGambleButtonClicked();
  }

  public showGamble(): void {
    this._gambleNode.stateMachine!.switchToState('show_gamble');
    this._gambleNode.touchable = true;
  }

  public hideGamble(): void {
    this._gambleNode.stateMachine!.switchToState('hide_gamble');
    this._gambleNode.touchable = false;
  }

  public isShown(): boolean {
    return (
      this._gambleNode.stateMachine!.isActive('show_gamble') ||
      this._gambleNode.stateMachine!.isActive('idle')
    );
  }

  public resetAnimation(): void {
    // Hook to fix the issue (SLTF-17034) that gamble button hiding animation was playing after gamble game.
    // It's caused that footer is disabled (active=false) during gamble game and in some cases animation don't have enough time to complete.
    this._gambleNode.stateMachine!.restart();
  }
}
