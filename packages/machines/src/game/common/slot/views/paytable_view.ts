import { Container, SceneObject, Button, TextSceneObject, SoundSceneObject } from '@cgs/syd';
import { ResourcesComponent } from '../../../components/resources_component';
import { SoundInstance } from '../../../../reels_engine/sound_instance';
import { T_ResourcesComponent } from '../../../../type_definitions';
import { PaytableController } from '../controllers/paytable_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';

export class PaytableView extends BaseSlotPopupView<PaytableController> {
  static readonly closeStateName: string = 'close';
  private _sound: SoundInstance;

  constructor(container: Container, _root: SceneObject, _popupView: SceneObject) {
    super(_root.parent!, _popupView, null, SlotPopups.Paytable);

    const closeButton = _popupView.findById<Button>('backtogame')!;
    closeButton.clicked.listen(() => this.onBackToGameClicked());

    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const wrapSound = res.sounds.findById('paytable_backtogame');

    this._sound =
      wrapSound && wrapSound.childs.length > 0
        ? new SoundInstance(wrapSound.childs[0] as SoundSceneObject, wrapSound.stateMachine)
        : SoundInstance.Empty;
  }

  private onBackToGameClicked(): void {
    this._sound.stop();
    this._sound.play();

    const closeState = this.view.stateMachine?.findById(PaytableView.closeStateName);
    if (this.view.stateMachine && closeState) {
      closeState.enterAction.done.listen(() => this.hide());
      this.view.stateMachine.switchToState(PaytableView.closeStateName);
    } else {
      this.hide();
    }
  }

  trySetSymbolValue(elementId: string, textValue: string): void {
    this.view.findAllById<TextSceneObject>(elementId).forEach((node) => {
      node.text = textValue;
    });
  }
}
