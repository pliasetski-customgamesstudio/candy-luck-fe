import { Container } from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import { IFreeSpinsModeProvider } from '../../../components/free_spins/i_free_spins_mode_provider';
import { GameStateMachineNotifierComponent } from '../../../components/game_state_machine_notifier_component';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_IFreeSpinsModeProvider,
  T_IFreeSpinsPopupViewUpdater,
} from '../../../../type_definitions';
import { StartFreeSpinsPopupView } from '../views/start_freespins_popup_view';
import { BaseSlotPopupController } from './base_popup_controller';
import { ISpinResponse } from '@cgs/common';
import { IFreeSpinsPopupViewUpdater } from '../../../components/free_spins/i_free_spins_popup_view_updater';

export class StartFreeSpinsPopupController extends BaseSlotPopupController<StartFreeSpinsPopupView> {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _stopBackgroundSoundOnStart: boolean;
  private _stopBackgroundSoundOnAdd: boolean;
  private _useFreeSpinMode: boolean;
  private _useViewUpdater: boolean;

  constructor(
    container: Container,
    notifier: GameStateMachineNotifierComponent,
    slotSession: SlotSession,
    popupView: StartFreeSpinsPopupView,
    stopBackgroundSoundOnStart: boolean,
    stopBackgroundSoundOnAdd: boolean,
    useFreeSpinMode: boolean,
    useViewUpdater: boolean = false
  ) {
    super(container, popupView, false);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._stopBackgroundSoundOnStart = stopBackgroundSoundOnStart;
    this._stopBackgroundSoundOnAdd = stopBackgroundSoundOnAdd;
    this._useFreeSpinMode = useFreeSpinMode;
    this._useViewUpdater = useViewUpdater;
  }

  onPopupClosed(): void {
    if (
      this._gameStateMachine.curResponse.freeSpinsInfo &&
      this.slotSoundController &&
      ((this._stopBackgroundSoundOnStart &&
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsStarted) ||
        (this._stopBackgroundSoundOnAdd &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event ==
            FreeSpinsInfoConstants.FreeSpinsAdded))
    ) {
      this.slotSoundController.playBackgroundSound();
    }

    this.gameStateMachineNotifier.notifier.NotifyListenersExited('popup');
    this.slotPopupCoordinator.onPopupHidden((this.view as StartFreeSpinsPopupView).popupId);

    this.navigationStack.unregister(this);

    this.gameStateMachineNotifier.gameStateMachine.doSpin();
  }

  onPopupShowing(): void {
    if (
      this._gameStateMachine.curResponse.freeSpinsInfo &&
      this.slotSoundController &&
      ((this._stopBackgroundSoundOnStart &&
        this._gameStateMachine.curResponse.freeSpinsInfo.event ==
          FreeSpinsInfoConstants.FreeSpinsStarted) ||
        (this._stopBackgroundSoundOnAdd &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event ==
            FreeSpinsInfoConstants.FreeSpinsAdded))
    ) {
      this.slotSoundController.stopBackgroundSound();
    }

    this.gameStateMachineNotifier.notifier.NotifyListenersEntered('popup');
    this.slotPopupCoordinator.onPopupShown((this.view as StartFreeSpinsPopupView).popupId);
    this.navigationStack.register(this);
  }

  onAnimCompleted(): void {
    this.view.hide();
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case 'beginFreeSpinsPopup':
        this.view.show();
        this.view.setFreeSpins(this._gameStateMachine.curResponse.freeSpinsInfo!.freeSpinsAdded!);
        this.view.postEvent('default');

        var param =
          this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsStarted
            ? 'freespins'
            : 'freespins_add';
        if (!this._useFreeSpinMode) {
          this.view.postEvent(param);
        } else {
          var modeProvider =
            this.container.forceResolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
          if (modeProvider) {
            var stateName = param + '_' + modeProvider.currentMode;
            this.view.postEvent(stateName);
          }
        }

        if (this._useViewUpdater) {
          var viewUpdater = this.container.resolve<IFreeSpinsPopupViewUpdater>(
            T_IFreeSpinsPopupViewUpdater
          );
          if (viewUpdater) {
            viewUpdater.updateViewBeforeShowingPopup(this.view.view);
          }
        }

        break;
      default:
        break;
    }
  }
}
