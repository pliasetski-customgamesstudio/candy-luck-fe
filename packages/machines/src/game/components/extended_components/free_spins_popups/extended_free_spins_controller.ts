import { Container, IStreamSubscription, Log } from '@cgs/syd';
import { BaseSlotPopupController } from '../../../common/slot/controllers/base_popup_controller';
import { IFreeSpinsModeProvider } from '../../free_spins/i_free_spins_mode_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_IFreeSpinsModeProvider,
  T_IFreeSpinsPopupViewUpdater,
} from '../../../../type_definitions';
import { ExtendedStartFreeSpinsPopupView } from './extended_free_spins_popup_view';
import { ISpinResponse } from '@cgs/common';
import { IFreeSpinsPopupViewUpdater } from '../../free_spins/i_free_spins_popup_view_updater';

export class ExtendedStartFreeSpinsController extends BaseSlotPopupController<ExtendedStartFreeSpinsPopupView> {
  private readonly _useFreeSpinMode: boolean;
  private readonly _useViewUpdater: boolean;
  private readonly _stopBackgroundSoundOnStart: boolean;
  private readonly _stopBackgroundSoundOnAdd: boolean;
  private readonly _defaultPopupOnGroupSwitch: boolean;
  private _streamSubscription: IStreamSubscription;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(
    popupView: ExtendedStartFreeSpinsPopupView,
    container: Container,
    stopBackgroundSoundOnStart: boolean,
    stopBackgroundSoundOnAdd: boolean,
    useFreeSpinMode: boolean,
    useViewUpdater: boolean,
    defaultPopupOnGroupSwitch: boolean
  ) {
    super(container, popupView, false);
    this._container = container;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._useFreeSpinMode = useFreeSpinMode;
    this._useViewUpdater = useViewUpdater;
    this._stopBackgroundSoundOnStart = stopBackgroundSoundOnStart;
    this._stopBackgroundSoundOnAdd = stopBackgroundSoundOnAdd;
    this._defaultPopupOnGroupSwitch = defaultPopupOnGroupSwitch;
  }

  public async showPopupAsync(count: number, popupName: string): Promise<void> {
    const task = this.view.show();
    this.view.setFreeSpins(count);
    this.view.postEvent('default');
    this.view.postEvent(popupName);
    return task;
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case 'beginFreeSpinsPopup':
        this.view.show();
        this.view.setFreeSpins(
          this._gameStateMachine.curResponse.freeSpinsInfo!.freeSpinsAdded as number
        );
        this.view.postEvent('default');

        let param =
          this._gameStateMachine.curResponse.freeSpinsInfo!.event ===
          FreeSpinsInfoConstants.FreeSpinsStarted
            ? 'freespins'
            : 'freespins_add';
        if (this._defaultPopupOnGroupSwitch) {
          param =
            this._gameStateMachine.curResponse.freeSpinsInfo!.event ===
              FreeSpinsInfoConstants.FreeSpinsStarted ||
            this._gameStateMachine.curResponse.freeSpinsInfo!.event ===
              FreeSpinsInfoConstants.FreeSpinsGroupSwitched
              ? 'freespins'
              : 'freespins_add';
        }

        if (!this._useFreeSpinMode) {
          this.view.postEvent(param);
        } else {
          const modeProvider =
            this._container.resolve<IFreeSpinsModeProvider>(T_IFreeSpinsModeProvider);
          if (modeProvider) {
            const stateName = param + '_' + modeProvider.currentMode;
            Log.Trace('CurrentMode for StartFS: ' + stateName);
            Log.Trace('Current FS Name: ' + this._gameStateMachine.curResponse.freeSpinsInfo!.name);
            this.view.postEvent(stateName);
          }
        }

        if (this._useViewUpdater) {
          const viewUpdater = this._container.resolve<IFreeSpinsPopupViewUpdater>(
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

  public onAnimCompleted(): void {
    this.view.hide();
  }

  public onPopupShowing(): void {
    if (
      this._gameStateMachine.curResponse.freeSpinsInfo &&
      this.slotSoundController &&
      ((this._stopBackgroundSoundOnStart &&
        this._gameStateMachine.curResponse.freeSpinsInfo.event ===
          FreeSpinsInfoConstants.FreeSpinsStarted) ||
        (this._stopBackgroundSoundOnAdd &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event ===
            FreeSpinsInfoConstants.FreeSpinsAdded))
    ) {
      this.slotSoundController.stopBackgroundSound();
    }

    this.gameStateMachineNotifier.notifier.NotifyListenersEntered('popup');
    this.slotPopupCoordinator.onPopupShown(this.view.popupId);
    this.navigationStack.register(this);
  }

  public onPopupClosed(): void {
    if (
      this._gameStateMachine.curResponse.freeSpinsInfo &&
      this.slotSoundController &&
      ((this._stopBackgroundSoundOnStart &&
        this._gameStateMachine.curResponse.freeSpinsInfo.event ===
          FreeSpinsInfoConstants.FreeSpinsStarted) ||
        (this._stopBackgroundSoundOnAdd &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event ===
            FreeSpinsInfoConstants.FreeSpinsAdded))
    ) {
      this.slotSoundController.playBackgroundSound();
    }

    this.gameStateMachineNotifier.notifier.NotifyListenersExited('popup');
    this.slotPopupCoordinator.onPopupHidden(this.view.popupId);

    this.navigationStack.unregister(this);

    this.gameStateMachineNotifier.gameStateMachine.doSpin();
  }
}
