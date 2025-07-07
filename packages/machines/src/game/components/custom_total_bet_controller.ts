import { InternalRespinSpecGroup } from '@cgs/common';
import { Container } from '@cgs/syd';
import { TotalBetController } from '../common/footer/controllers/total_bet_controller';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class CustomTotalBetController extends TotalBetController {
  private _respinName: string;
  private _freeSpinsNames: string[];

  constructor(container: Container, respinName: string, freeSpinsNames: string[]) {
    super(container);
    this._respinName = respinName;
    this._freeSpinsNames = freeSpinsNames;
    this.gameStateMachine.freeSpinsRecovery.entered.listen((e) =>
      this.onFreeSpinsRecoveryEntered()
    );
  }

  onFreeSpinsEntered(): void {
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this._freeSpinsNames.includes(this.gameStateMachine.curResponse.freeSpinsInfo?.name!)
    ) {
      if (
        this.gameStateMachine.curResponse.freeSpinsInfo!.event !==
        FreeSpinsInfoConstants.FreeSpinsFinished
      ) {
        const respinGroup =
          this.gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
            ? this.gameStateMachine.curResponse.additionalData
            : null;
        if (
          !respinGroup ||
          (respinGroup.respinStarted && respinGroup.respinCounter === respinGroup.groups.length)
        ) {
          this.view.setFreeSpinsMode(
            this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! - 1,
            this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! +
              this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.usedCount,
            this.slotSession.isMaxBet,
            this.slotSession.isXtremeBetNow,
            this.slotSession.totalBet,
            this.slotSession.currentBet.calculationType
          );
        }
      }
    } else if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.name === this._respinName &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.freeSpinGroups!.some((x) =>
        this._freeSpinsNames.includes(x!.name!)
      ) &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.event !==
        FreeSpinsInfoConstants.FreeSpinsFinished
    ) {
      if (this.gameStateMachine.curResponse.freeSpinsInfo) {
        const group = this.gameStateMachine.curResponse.freeSpinsInfo!.freeSpinGroups!.find((x) =>
          this._freeSpinsNames.includes(x!.name!)
        )!;
        this.view.setFreeSpinsMode(
          group.count!,
          group.count! + group.usedCount,
          this.slotSession.isMaxBet,
          this.slotSession.isXtremeBetNow,
          this.slotSession.totalBet,
          this.slotSession.currentBet.calculationType
        );
      }
    } else if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.name === this._respinName &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.event !==
        FreeSpinsInfoConstants.FreeSpinsFinished
    ) {
      this.view.setRespinsMode(
        this.slotSession.isMaxBet,
        this.slotSession.isXtremeBetNow,
        this.slotSession.totalBet,
        this.slotSession.currentBet.calculationType
      );
    }
  }

  onFreeSpinsRecoveryEntered(): void {
    this.view.setTotalBet(
      this.slotSession.totalBet,
      this.slotSession.isMaxBet,
      this.slotSession.isXtremeBetNow
    );
  }

  onBeginFreeSpinsEntered(): void {
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this._freeSpinsNames.includes(this.gameStateMachine.curResponse.freeSpinsInfo?.name!)
    ) {
      this.view.setFreeSpinsMode(
        this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count!,
        this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! +
          this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.usedCount,
        this.slotSession.isMaxBet,
        this.slotSession.isXtremeBetNow,
        this.slotSession.totalBet,
        this.slotSession.currentBet.calculationType
      );
    } else if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.name === this._respinName &&
      !this.gameStateMachine.curResponse.freeSpinsInfo!.freeSpinGroups!.some((x) =>
        this._freeSpinsNames.includes(x!.name!)
      )
    ) {
      this.view.setRespinsMode(
        this.slotSession.isMaxBet,
        this.slotSession.isXtremeBetNow,
        this.slotSession.totalBet,
        this.slotSession.currentBet.calculationType
      );
    }
  }

  onFreePopupLeaved(): void {
    if (
      this.gameStateMachine.curResponse.freeSpinsInfo &&
      (this.gameStateMachine.curResponse.freeSpinsInfo!.event !==
        FreeSpinsInfoConstants.FreeSpinsGroupSwitched ||
        !this._freeSpinsNames.includes(this.gameStateMachine.curResponse.freeSpinsInfo?.name))
    ) {
      this.view.disableFreeSpinsMode(
        this.slotSession.totalBet,
        this.slotSession.isMaxBet,
        this.slotSession.isXtremeBetNow
      );
    }
  }

  onBonusRecoveryEntered(): void {
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this._freeSpinsNames.includes(this.gameStateMachine.curResponse.freeSpinsInfo?.name!)
    ) {
      if (this.gameStateMachine.curResponse.freeSpinsInfo) {
        this.view.setFreeSpinsMode(
          this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! - 1,
          this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! +
            this.gameStateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.usedCount,
          this.slotSession.isMaxBet,
          this.slotSession.isXtremeBetNow,
          this.slotSession.totalBet,
          this.slotSession.currentBet.calculationType
        );
      }
    } else if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.name === this._respinName &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.freeSpinGroups!.some((x) =>
        this._freeSpinsNames.includes(x!.name!)
      )
    ) {
      const group = this.gameStateMachine.curResponse.freeSpinsInfo?.freeSpinGroups!.find((x) =>
        this._freeSpinsNames.includes(x!.name!)
      )!;
      this.view.setFreeSpinsMode(
        group.count!,
        group.count! + group.usedCount,
        this.slotSession.isMaxBet,
        this.slotSession.isXtremeBetNow,
        this.slotSession.totalBet,
        this.slotSession.currentBet.calculationType
      );
    } else if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo &&
      this.gameStateMachine.curResponse.freeSpinsInfo.name === this._respinName &&
      this.gameStateMachine.curResponse.freeSpinsInfo.event !==
        FreeSpinsInfoConstants.FreeSpinsFinished
    ) {
      this.view.setRespinsMode(
        this.slotSession.isMaxBet,
        this.slotSession.isXtremeBetNow,
        this.slotSession.totalBet,
        this.slotSession.currentBet.calculationType
      );
    }
  }
}
