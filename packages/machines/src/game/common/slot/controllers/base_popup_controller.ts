import { IBackHandler, INavigationStack, T_INavigationStack } from '@cgs/common';
import { Container } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { BaseSlotSoundController } from '../../base_slot_sound_controller';
import { ISlotPopupView } from '../../base_slot_view';
import { ISlotPopupCoordinator } from '../../slot_popup_coordinator';
import { T_BaseSlotSoundController, T_ISlotPopupCoordinator } from '../../../../type_definitions';

export class BaseSlotPopupController<T extends ISlotPopupView>
  extends BaseSlotController<T>
  implements IBackHandler
{
  static readonly popupState: string = 'popup';
  private _navigationStack: INavigationStack;
  get navigationStack(): INavigationStack {
    return this._navigationStack;
  }
  private _slotPopupCoordinator: ISlotPopupCoordinator;
  get slotPopupCoordinator(): ISlotPopupCoordinator {
    return this._slotPopupCoordinator;
  }
  private _slotSoundController: BaseSlotSoundController;
  get slotSoundController(): BaseSlotSoundController {
    return this._slotSoundController;
  }
  private _stopBackgroundSound: boolean;

  constructor(container: Container, popupView: T, stopBackgroundSound: boolean) {
    super(container, popupView);
    this._stopBackgroundSound = stopBackgroundSound;
    this._navigationStack = container.forceResolve<INavigationStack>(T_INavigationStack);
    this._slotPopupCoordinator =
      container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._slotSoundController =
      container.forceResolve<BaseSlotSoundController>(T_BaseSlotSoundController);

    this.view = popupView;
    this.view.shown.listen(() => this.onPopupShown());
    this.view.showing.listen(() => this.onPopupShowing());
    this.view.closed.listen(() => this.onPopupClosed());
  }

  handleBackKey(): boolean {
    this.view.hide();
    return true;
  }

  protected onPopupClosed(): void {
    if (this._stopBackgroundSound && this._slotSoundController) {
      this._slotSoundController.playBackgroundSound();
    }

    this.gameStateMachineNotifier.notifier.NotifyListenersExited('popup');
    this._slotPopupCoordinator.onPopupHidden(this.view.popupId!);
    this._navigationStack.unregister(this);
  }

  protected onPopupShowing(): void {
    if (this._stopBackgroundSound && this._slotSoundController) {
      this._slotSoundController.stopBackgroundSound();
    }

    this.gameStateMachineNotifier.notifier.NotifyListenersEntered('popup');
    this._slotPopupCoordinator.onPopupShown(this.view.popupId!);
    this._navigationStack.register(this);
  }

  protected onPopupShown(): void {}
}
