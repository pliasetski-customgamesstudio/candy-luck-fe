import { BonusGameProvider } from './bonus_game_provider';
import { InternalFreeSpinsGroup, InternalFreeSpinsInfo, SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IBonusSharer, T_IBonusSharer } from '../../../i_bonus_sharer';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';

export class BonusGameWithFreeSpinsProvider extends BonusGameProvider {
  private _fsTypes: string[];
  get fsTypes(): string[] {
    return this._fsTypes;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    fsTypes: string[],
    hideSlot: boolean = true,
    hideHud: boolean = true,
    externalScenesIds: string[] | null = null
  ) {
    super(container, sceneCommon, hideSlot, hideHud, null, externalScenesIds);
    this._fsTypes = fsTypes;
  }

  async onMiniGameFinishing(): Promise<void> {
    this.processBonusResults();
    const selectedButtons = this.bonusGame?.bonusResponse.currentRound?.selectedButtons || null;
    if (selectedButtons) {
      const fsButton = selectedButtons.find((button) => this.fsTypes.includes(button.type));
      if (!fsButton) {
        this.container.forceResolve<IBonusSharer>(T_IBonusSharer).shareBonus();
      }
    }
    if (
      this.stateMachine.curResponse.isFreeSpins &&
      this.stateMachine.curResponse.freeSpinsInfo?.event !== FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      this.stateMachine.curResponse.freeSpinsInfo!.totalWin +=
        this.bonusGame!.bonusResponse.result!.totalWin;
      this.stateMachine.curResponse.totalWin = this.bonusGame!.bonusResponse.result!.totalWin;
    }
    this.stateMachine.curResponse.bonusInfo = null;
    if (this.stateMachine.curResponse.winPositions) {
      this.stateMachine.curResponse.winPositions = this.removeWinIcons(
        this.stateMachine.curResponse.winPositions,
        ['bonus', 'bonusWild']
      );
    }

    if (this.bonusGame?.bonusResponse.freeSpinsInfo) {
      this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame.bonusResponse.freeSpinsInfo;
    }

    this.dynamicDrawOrdersProvider?.normalizeDrawOrders();

    // gameStateMachine.resume();
  }

  processBonusResults(): void {
    const selectedButtons = this.bonusGame!.bonusResponse.currentRound!.selectedButtons;
    if (selectedButtons) {
      const fsButton = selectedButtons.find((button) => this.fsTypes.includes(button.type));
      if (fsButton) {
        if (!this.stateMachine.curResponse.freeSpinsInfo) {
          this.stateMachine.curResponse.freeSpinsInfo = new InternalFreeSpinsInfo();
          this.stateMachine.curResponse.freeSpinsInfo.totalWin = 0.0;
          this.stateMachine.curResponse.freeSpinsInfo.event =
            FreeSpinsInfoConstants.FreeSpinsStarted;
        } else {
          this.stateMachine.curResponse.freeSpinsInfo.event = FreeSpinsInfoConstants.FreeSpinsAdded;
        }

        this.stateMachine.curResponse.freeSpinsInfo.name = this.bonusGame!.bonusResponse.bonusType;
        if (!this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup) {
          this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup =
            new InternalFreeSpinsGroup();
          this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.name =
            FreeSpinsInfoConstants.FreeFreeSpinsGroupName;
          this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.marker = fsButton.type;
          this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.count = 0;
        }
        this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.bet =
          this.bonusGame!.bonusResponse.result!.bet;
        this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.lines =
          this.bonusGame!.bonusResponse.result!.lines;
        this.stateMachine.curResponse.freeSpinsInfo.freeSpinsAdded = fsButton.value;
        this.stateMachine.curResponse.freeSpinsInfo.currentFreeSpinsGroup.count! += fsButton.value;
        if (this.bonusGame?.bonusResponse.freeSpinsInfo) {
          this.stateMachine.curResponse.freeSpinsInfo = this.bonusGame.bonusResponse.freeSpinsInfo;
        }
      }
    }
  }
}

export class BonusGameWithFreeSpinsAsBonusWinProvider extends BonusGameWithFreeSpinsProvider {
  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    fsTypes: string[],
    hideSlot: boolean = true,
    hideHud: boolean = true
  ) {
    super(container, sceneCommon, fsTypes, hideSlot, hideHud);
  }

  processBonusResults(): void {
    super.processBonusResults();
    this.stateMachine.curResponse.freeSpinsInfo!.freeSpinsAdded = Math.floor(
      this.bonusGame!.finishArgs.bonusWin!
    );
    this.stateMachine.curResponse.freeSpinsInfo!.currentFreeSpinsGroup!.count! += Math.floor(
      this.bonusGame!.finishArgs.bonusWin!
    );
  }
}
