import {
  EventDispatcher,
  Button,
  SceneObject,
  IStreamSubscription,
  EventStream,
  Container,
  SoundSceneObject,
} from '@cgs/syd';
import { BaseSlotPopupView, SlotPopups } from '../common/slot/views/base_popup_view';
import { NotEnoughBalanceController } from './not_enough_balance_controller';
import { SoundInstance } from '../../reels_engine/sound_instance';
import { ResourcesComponent } from './resources_component';
import { T_ResourcesComponent } from '../../type_definitions';

export class NotEnoughBalanceView extends BaseSlotPopupView<NotEnoughBalanceController> {
  private _CloseBtnClickedSub: IStreamSubscription;
  private _CloseBtnClickedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get closeBtnClicked(): EventStream<void> {
    return this._CloseBtnClickedDispatcher.eventStream;
  }
  private _CloseBtn: Button;
  private _Modes: SceneObject;
  get closeBtn(): Button {
    return this._CloseBtn;
  }

  constructor(root: SceneObject, popupView: SceneObject, container: Container) {
    super(root, popupView, null, SlotPopups.NotEnoughBalance);
    this._CloseBtn = popupView.findById<Button>('okBtn')!;
    this._Modes = popupView.findById<SceneObject>('Modes')!;

    const resourcesComponent = container.resolve<ResourcesComponent>(T_ResourcesComponent);
    const buttonClickSoundScene = resourcesComponent?.sounds
      .findById<SoundSceneObject>('button_click')
      ?.findAllByType(SoundSceneObject)[0];
    const buttonClickSound = new SoundInstance(buttonClickSoundScene || null);

    this._CloseBtnClickedSub = this._CloseBtn.clicked.listen(() => {
      buttonClickSound.stop();
      buttonClickSound.play();
      this.onCloseBtnClicked();
    });
  }

  private onCloseBtnClicked(): void {
    this._CloseBtnClickedDispatcher.dispatchEvent();
    this._Modes.stateMachine!.switchToState('hide');
    this.controller.onAnimCompleted();
  }

  public showPopup(): void {
    this._Modes.stateMachine!.switchToState('show');
  }

  public dispose(): void {
    this._CloseBtnClickedSub.cancel();
  }
}
