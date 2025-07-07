import { TextSceneObject, State, SceneObject, Container, Button } from '@cgs/syd';
import { StartFreeSpinsPopupController } from '../controllers/start_freespins_popup_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';
import { IFreeSpinsModeProvider } from '../../../components/free_spins/i_free_spins_mode_provider';
import { T_IFreeSpinsModeProvider } from '../../../../type_definitions';

export class StartFreeSpinsPopupView extends BaseSlotPopupView<StartFreeSpinsPopupController> {
  private _spinsCount: TextSceneObject[];
  private _freespins: State | null;
  private _freespinsAdd: State | null;
  private popupView: SceneObject;

  constructor(
    _root: SceneObject,
    private _popupView: SceneObject,
    private startByButton: boolean,
    private container: Container,
    private useFreeSpinMode: boolean
  ) {
    super(_root, _popupView, null, SlotPopups.StartFreeSpins);
    this.popupView = _popupView;
    this._spinsCount = _popupView.findAllById('freespin_text').map((t) => t as TextSceneObject);

    if (startByButton) {
      const startButtons = _popupView.findAllById('btnStart').map((t) => t as Button);
      for (const startButton of startButtons) {
        startButton.clicked.listen(() => this.onBackToGameClicked());
      }

      this._freespinsAdd = _popupView.stateMachine!.findById('freespins_add');
      if (this._freespinsAdd) {
        this._freespinsAdd.enterAction.done.listen(() => this.onAnimationCompleted());
      } else {
        if (this.useFreeSpinMode) {
          this._subscribeCloseEventWithFreeSpinMode(container, _popupView, 'freespins_add_');
        }
      }
    } else {
      if (this.useFreeSpinMode) {
        this._subscribeCloseEventWithFreeSpinMode(container, _popupView, 'freespins_add_');

        this._subscribeCloseEventWithFreeSpinMode(container, _popupView, 'freespins_');
      } else {
        this._freespins = _popupView.stateMachine!.findById('freespins');

        if (this._freespins) {
          this._freespins.enterAction.done.listen(() => this.onAnimationCompleted());
        } else {
          console.log('State freespins is absent');
        }

        this._freespinsAdd = _popupView.stateMachine!.findById('freespins_add');
        if (this._freespinsAdd) {
          this._freespinsAdd.enterAction.done.listen(() => this.onAnimationCompleted());
        } else {
          console.log('State freespins_add is absent');
        }
      }
    }
  }

  private onBackToGameClicked(): void {
    const closeStateName = 'close';
    const closeState = this.popupView.stateMachine?.findById(closeStateName);
    if (closeState) {
      closeState.enterAction.done.listen(() => this.controller.onAnimCompleted());
      this.popupView.stateMachine?.switchToState(closeStateName);
    } else {
      this.controller.onAnimCompleted();
    }
  }

  public setFreeSpins(freespins: number) {
    for (const text of this._spinsCount) {
      text.text = freespins.toString();
    }
  }

  private onAnimationCompleted(): void {
    this.controller.onAnimCompleted();
  }

  private _subscribeCloseEventWithFreeSpinMode(
    container: Container,
    view: SceneObject,
    pattern: string
  ) {
    const modeProvider = container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
    if (modeProvider) {
      modeProvider.AllViews!.forEach((x) => {
        const state = view.stateMachine!.findById(pattern + x);
        state?.enterAction.done.listen(() => this.onAnimationCompleted());
      });
    }
  }
}
