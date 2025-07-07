import { ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import { Container } from '@cgs/syd';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { TotalWinCoinsProvider } from '../../../components/total_win_coins_provider';
import { ISpinParams } from '../../../../reels_engine/game_components/i_spin_params';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_ISpinParams,
  T_TotalWinCoinsProvider,
} from '../../../../type_definitions';
import { SpinController } from '../controllers/spin_controller';
import { BaseListener } from './base_listener';

export class SpinViewMachineListener extends BaseListener<SpinController> {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  public viewController: SpinController;
  private _totalWinCoinsProvider: TotalWinCoinsProvider | null;
  private _spinParams: ISpinParams;

  constructor(container: Container) {
    super(container);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._totalWinCoinsProvider = container.resolve<TotalWinCoinsProvider>(T_TotalWinCoinsProvider);
    this._spinParams = container.forceResolve<ISpinParams>(T_ISpinParams);
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.onAccelerateEntered();
        break;
      case GameStateMachineStates.VerifyBalance:
        this.onVerifyBalanceEntered();
        break;
      case GameStateMachineStates.Stopping:
        this.onStoppingEntered();
        break;
      case GameStateMachineStates.Collapse:
        this.onCollapseStateEntered();
        break;
      case GameStateMachineStates.ImmediatelyStop:
        this.onImmediatelyStopEntered();
        break;
      case GameStateMachineStates.Stop:
        this.onStopEntered();
        break;
      case GameStateMachineStates.Bonus:
        this.onBonusEntered();
        break;
      default:
        break;
    }
  }

  public OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
        this.onBonusExited();
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.onEndFreeSpinsPopupExited();
        break;
      case GameStateMachineStates.Animation:
        this.onAnimationExit();
        break;
      default:
        break;
    }
  }

  private onEndFreeSpinsPopupExited(): void {}

  private onAccelerateEntered(): void {
    if (!this._gameStateMachine.curResponse.isRespin) {
      if (
        this._gameStateMachine.isAutoSpins &&
        (!this._gameStateMachine.curResponse.isFreeSpins ||
          this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
            FreeSpinsInfoConstants.FreeSpinsFinished)
      ) {
        this.viewController.enableStopButtonOnAccelerate();
      }
      this.viewController.decreaseBalanceAndStopUpdate();
    }
  }

  private onVerifyBalanceEntered(): void {
    this.viewController.verifyBalance();
  }

  private onStoppingEntered(): void {
    this.viewController.enableStopButton();
  }

  private onCollapseStateEntered(): void {
    this.viewController.disableSpinButton();
  }

  private onImmediatelyStopEntered(): void {
    if (this._spinParams.autoSpin) {
    }
    this.viewController.disableSpinButton();
  }

  private onStopEntered(): void {
    if (this._gameStateMachine.curResponse.isFreeSpins) {
      if (
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
        FreeSpinsInfoConstants.FreeSpinsFinished
      ) {
        this.viewController.disableSpinButton();
      } else if (
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsStarted &&
        this._gameStateMachine.curResponse.isRespin
      ) {
        this.viewController.enableStopButtonOnAccelerate();
      } else {
        this.viewController.disableStopButton();
      }
    }

    const respinGroup =
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;

    if (respinGroup && respinGroup.respinCounter < respinGroup.groups.length - 1) {
      if (this._gameStateMachine.isAutoSpins) {
        this.viewController.enableStopButtonOnAccelerate();
      } else {
        this.viewController.disableStopButton();
      }
    }

    this.viewController.checkAutoSpinCondition();
  }

  private onStopExit(): void {
    this.viewController.updateBalance();
  }

  private onAnimationExit(): void {
    const freeSpinsInfo = this._gameStateMachine.curResponse.freeSpinsInfo;

    if (freeSpinsInfo && freeSpinsInfo.event === FreeSpinsInfoConstants.FreeSpinsFinished) {
      return;
    }

    this.viewController.updateBalance();
  }

  private onBonusEntered(): void {
    this.viewController.disableSpinButton();
  }

  private onBonusExited(): void {
    this.viewController.enableSpins();
  }
}
