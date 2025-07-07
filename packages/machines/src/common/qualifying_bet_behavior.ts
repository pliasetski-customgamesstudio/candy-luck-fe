import { BaseSlotGame } from '../game/base_slot_game';
import { SlotSession, SlotSessionProperties } from '../game/common/slot_session';
import { ISlotSessionProvider } from '../game/components/interfaces/i_slot_session_provider';
import { GameOperation } from '../game_operation';
import { GameStateMachine } from '../reels_engine/state_machine/game_state_machine';
import { IQualifyingBetSupport } from './i_qualifying_bet_support';
import { IQualifyingBetService } from './qualifying_bet_service';
import { EventStreamSubscription, IDisposable, State } from '@cgs/syd';
import { ISpinResponse, InternalBet } from '@cgs/common';
import { IBetUpdaterProvider } from '../game/components/i_bet_updater_provider';
import { T_IBetUpdaterProvider, T_ISlotSessionProvider } from '../type_definitions';

export class QualifyingBetBehavior implements IDisposable {
  private _operation: GameOperation;
  private _qbSupport: IQualifyingBetSupport;
  private _qbService: IQualifyingBetService;
  private _increaseBetTooltipShown: boolean = false;
  private _spinCounter: number = 0;
  private _slotSession: SlotSession;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _betsUpdater: IBetUpdaterProvider;
  private _accelSub: EventStreamSubscription<State>;
  private _slotSessionSub: EventStreamSubscription<SlotSessionProperties>;
  private _betsUpdaterSub: EventStreamSubscription<void>;
  private _qualifyingBetChangedSub: EventStreamSubscription<void>;

  constructor(
    operation: GameOperation,
    qbSupport: IQualifyingBetSupport,
    qbService: IQualifyingBetService
  ) {
    this._operation = operation;
    this._qbSupport = qbSupport;
    this._qbService = qbService;

    const baseSlotGame = this._operation.gameView as BaseSlotGame;

    this._slotSession =
      baseSlotGame.slotServiceContainer.forceResolve<ISlotSessionProvider>(
        T_ISlotSessionProvider
      ).slotSession;
    this._gameStateMachine = baseSlotGame.getGameStateMachine();
    this._betsUpdater =
      baseSlotGame.slotServiceContainer.forceResolve<IBetUpdaterProvider>(T_IBetUpdaterProvider);
    this._accelSub = this._gameStateMachine.accelerate.entered.listen((s) =>
      this.onAccelerateEntered()
    );
    this._slotSessionSub = this._slotSession.propertyChanged.listen((e) => {
      if (e === SlotSessionProperties.BetIndex) {
        this.onBetIndexChanged();
      }
      if (e === SlotSessionProperties.Bet) {
        this.onBetIndexChanged();
      }
    });
    this._betsUpdaterSub = this._betsUpdater.betsUpdated.listen(async (e) => {
      await this._qbSupport.refreshQb();
      this.onBetIndexChanged();
    });

    this._qualifyingBetChangedSub = this._qbService.qualifyingBetChanged.listen((e) =>
      this.onQbServiceBetsChanged()
    );
  }

  private slotSessionOnBetChanged(obj: InternalBet): void {
    this.onBetIndexChanged();
  }

  private onQbServiceBetsChanged(): void {
    if (
      this._qbService.featureQualifyingBets?.hasOwnProperty(this._qbSupport.qbFeatureName) ??
      false
    ) {
      this._qbSupport.setTotalQb(
        this._qbService.featureQualifyingBets.get(this._qbSupport.qbFeatureName) as number
      );
    }
  }

  private onAccelerateEntered(): void {
    if (
      !this._operation.isFreeSpinsOrBonus() &&
      this.betIsNotMax() &&
      this._qbSupport.isEnabled() &&
      this._qbSupport.isBetToastsNeeded() &&
      !this._qbService.qbGaugesLocked
    ) {
      const isBetNotQb = this.betIsNotQb();
      if (
        this._qbSupport.unqualifiedBetToastInterval > 0 &&
        this._spinCounter >= this._qbSupport.unqualifiedBetToastInterval &&
        isBetNotQb
      ) {
        this._qbSupport.showUnqualifiedBetToast();
        this._spinCounter = 1;
      } else if (
        this._qbSupport.notMaxBetToastInterval > 0 &&
        this._spinCounter >= this._qbSupport.notMaxBetToastInterval &&
        !isBetNotQb
      ) {
        this._qbSupport.showNotMaxBetToast();
        this._spinCounter = 1;
      } else {
        this._spinCounter++;
      }
    } else {
      this._spinCounter = 1;
    }
  }

  private onBetIndexChanged(): void {
    if (!this._qbSupport.isEnabled()) {
      return;
    }

    if (this.betIsNotQb()) {
      if (!this._increaseBetTooltipShown) {
        this._increaseBetTooltipShown = true;

        if (
          !this._operation.isFreeSpinsOrBonus() &&
          this._qbSupport.isBetToastsNeeded() &&
          !this._qbService.qbGaugesLocked
        ) {
          this._qbSupport.showUnqualifiedBetToast();
          this._spinCounter = 1;
        }
        this._qbSupport.disableIndicator();
      }
    } else {
      this._increaseBetTooltipShown = false;
      this._qbSupport.enableIndicator();
    }
  }

  private betIsNotMax(): boolean {
    return this.getCurrentBet() < this._slotSession.getMaxBet().bet;
  }

  private getCurrentBet(): number {
    if (this._operation.isFreeSpins()) {
      const bet = this._gameStateMachine.curResponse?.freeSpinsInfo?.currentFreeSpinsGroup?.bet;
      if (typeof bet === 'number') {
        return bet;
      }
    }
    return this._slotSession.currentBet.bet;
  }

  private betIsNotQb(): boolean {
    return this._qbSupport.qbInCoins
      ? this._slotSession.totalBet < this._qbSupport.getQb()
      : this.getCurrentBet() < this._qbSupport.getQbMultiplier() * this._slotSession.defaultBet;
  }

  public dispose(): void {
    this._accelSub?.cancel();
    this._slotSessionSub?.cancel();
    this._betsUpdaterSub?.cancel();
    this._qualifyingBetChangedSub?.cancel();
  }
}
