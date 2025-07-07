import { Container } from '@cgs/syd';
import { BaseSlotPopupController } from '../../../common/slot/controllers/base_popup_controller';
import { BaseSlotPopupView } from '../../../common/slot/views/base_popup_view';
import { SlotSession } from '../../../common/slot_session';
import { GameStateMachineNotifierComponent } from '../../game_state_machine_notifier_component';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { Game112StartFreeSpinsPopupView } from './game112_start_free_spins_popup_view';
import { ISpinResponse } from '@cgs/common';
import { T_IGameStateMachineProvider } from '../../../../type_definitions';

export class Game112StartFreeSpinsPopupController extends BaseSlotPopupController<Game112StartFreeSpinsPopupView> {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _stopBackgroundSoundOnStart: boolean;
  private _stopBackgroundSoundOnAdd: boolean;
  private _useFreeSpinMode: boolean;

  constructor(
    container: Container,
    notifier: GameStateMachineNotifierComponent,
    slotSession: SlotSession,
    popupView: Game112StartFreeSpinsPopupView,
    stopBackgroundSoundOnStart: boolean,
    stopBackgroundSoundOnAdd: boolean,
    useFreeSpinMode: boolean
  ) {
    super(container, popupView, false);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._stopBackgroundSoundOnStart = stopBackgroundSoundOnStart;
    this._stopBackgroundSoundOnAdd = stopBackgroundSoundOnAdd;
    this._useFreeSpinMode = useFreeSpinMode;
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
    if (this.view instanceof BaseSlotPopupView) {
      this.slotPopupCoordinator.onPopupHidden(this.view.popupId);
    }

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
    if (f_isBaseSlotPopupView(this.view)) {
      this.slotPopupCoordinator.onPopupShown(this.view.popupId);
    }
    this.navigationStack.register(this);
  }

  onAnimCompleted(): void {
    this.view.hide();
  }

  OnStateEntered(slotState: string): void {
    if (slotState === 'beginFreeSpinsPopup') {
      const current = this._gameStateMachine.curResponse;
      let param =
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
        FreeSpinsInfoConstants.FreeSpinsStarted
          ? 'freespins'
          : 'freespins_add';

      if (current.specialSymbolGroups && param != 'freespins_add') {
        if (
          current.freeSpinReBuyInfo &&
          current.freeSpinReBuyInfo.paymentOption &&
          current.freeSpinReBuyInfo.paymentOption.enabled
        ) {
          if (
            current.specialSymbolGroups.some((arg) => arg.type == 'Multiplier') &&
            current.specialSymbolGroups.some((arg) => arg.type == 'ReTrigger')
          ) {
            param = 'freespins_multiplier_retrigger';
          } else if (current.specialSymbolGroups.some((arg) => arg.type == 'Multiplier')) {
            param = 'freespins_multiplier';
          } else if (current.specialSymbolGroups.some((arg) => arg.type == 'ReTrigger')) {
            param = 'freespins_retrigger';
          }
        } else if (
          current.specialSymbolGroups.some((arg) => arg.type == 'Multiplier') ||
          current.specialSymbolGroups.some((arg) => arg.type == 'ReTrigger') ||
          current.specialSymbolGroups.some((arg) => arg.type == 'FreeSpinType')
        ) {
          this.gameStateMachineNotifier.gameStateMachine.doSpin();
          return; //skip popup on bonus game popups;
        }
      }

      this.view.show();
      this.view.setFreeSpins(
        this._gameStateMachine.curResponse.freeSpinsInfo!.freeSpinsAdded as number
      );
      this.view.postEvent('default');
      this.view.postEvent(param);
    }
  }
}

function f_isBaseSlotPopupView(
  obect: any
): obect is BaseSlotPopupView<Game112StartFreeSpinsPopupView> {
  return obect instanceof BaseSlotPopupView;
}
