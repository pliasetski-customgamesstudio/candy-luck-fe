import { Container, EventStreamSubscription } from '@cgs/syd';
import { BonusGameProvider } from '../../../components/mini_game/bonus_game_provider';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';
import { BonusRecoveryPopupView } from '../views/bonus_recovery_popup_view';
import { BaseSlotPopupController } from './base_popup_controller';
import { T_BonusGameProvider } from '../../../../type_definitions';

export class BonusRecoveryPopupController extends BaseSlotPopupController<BonusRecoveryPopupView> {
  private _bonusGameProvider: BonusGameProvider;
  private _closing: boolean;

  constructor(container: Container, popupView: BonusRecoveryPopupView) {
    super(container, popupView, false);
    this._bonusGameProvider = container.forceResolve<BonusGameProvider>(T_BonusGameProvider);
  }

  public handleBackKey(): boolean {
    this.cancel();
    return true;
  }

  public onPopupShowing(): void {
    super.onPopupShowing();
    this._closing = false;
  }

  public accept(): void {
    if (!this._closing) {
      this._closing = true;
      this.gameStateMachineNotifier.gameStateMachine.resume();
      let shownSub: EventStreamSubscription<void>;
      shownSub = this._bonusGameProvider.onMiniGameShown.listen((e) => {
        shownSub.cancel();
        this.view.hide();
      });
    }
  }

  public cancel(): void {
    if (!this._closing) {
      this._closing = true;
      this.gameStateMachineNotifier.gameStateMachine.curResponse.bonusInfo = null;
      this.view.hide();
      this.gameStateMachineNotifier.gameStateMachine.resume();
    }
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BonusRecovery:
        this.view.show();
        break;
      default:
        break;
    }
  }
}
