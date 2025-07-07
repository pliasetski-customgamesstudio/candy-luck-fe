import { InternalRespinSpecGroup, InternalCollapsingSpecGroup, ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { SlotSession, SlotSessionProperties } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { RespinShowWinProvider } from '../../../components/respin_show_win_provider';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotSessionProvider,
  T_IHudCoordinator,
  T_ISlotGame,
  T_RespinShowWinProvider,
} from '../../../../type_definitions';
import { IHudCoordinator } from '../i_hud_coordinator';
import { WinTextView } from '../views/win_text_view';

export function fold<T, E>(
  values: E[],
  initialValue: T,
  combine: (previousValue: T, element: E) => T
): T {
  let value = initialValue;
  for (const element of values) {
    value = combine(value, element);
  }
  return value;
}

export class WinTextController extends BaseSlotController<WinTextView> {
  private _session: SlotSession;
  get session(): SlotSession {
    return this._session;
  }
  private _stateMachine: GameStateMachine<ISpinResponse>;
  get stateMachine(): GameStateMachine<ISpinResponse> {
    return this._stateMachine;
  }
  private _hudCoordinator: IHudCoordinator;
  get hudCoordinator(): IHudCoordinator {
    return this._hudCoordinator;
  }
  private _respinShowWinProvider: RespinShowWinProvider | null;
  get respinShowWinProvider(): RespinShowWinProvider | null {
    return this._respinShowWinProvider;
  }
  private _waysCount: number;
  get waysCount(): number {
    return this._waysCount;
  }
  private _isMatch3Game: boolean;

  constructor(container: Container, waysCount: number = 0, isMatch3Game: boolean = false) {
    super(container, null);
    this._session =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._hudCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    this._respinShowWinProvider = container.resolve<RespinShowWinProvider>(T_RespinShowWinProvider);
    this._stateMachine = this.gameStateMachineNotifier.gameStateMachine;
    this._session.propertyChanged.listen((property) => this.SessionPropertyChanged(property));
    this._waysCount = waysCount;
    this._isMatch3Game = isMatch3Game;
  }

  private SessionPropertyChanged(property: SlotSessionProperties): void {
    switch (property) {
      case SlotSessionProperties.TotalWin:
        this.setTotalWin(this._session.totalWin);
        break;
      case SlotSessionProperties.AddTotalWin:
        this.addTotalWin(this._session.totalWin, this._session.currentWin);
        break;
      case SlotSessionProperties.AddCurrentWin:
        this.addCurrentWin(this._session.totalWin, this._session.currentWin);
        break;
      case SlotSessionProperties.ResetWinState:
        this.resetWinState();
        break;
      case SlotSessionProperties.Lines:
        this.setLinesWays();
        break;
      case SlotSessionProperties.TotalBet:
        this.setTotalWin(0);
        break;
    }
  }

  public initialize(totalWinView: WinTextView): void {
    super.view = totalWinView;
    super.view.controller = this;

    this.setTotalWin(0);
  }

  private setLinesWays(): void {
    if (this._session.currentLine == 1) {
      if (this._isMatch3Game) {
        this.view.setLinesWays(this._session.currentLine, 'match');
      } else {
        const gameParams = this.container.forceResolve<ISlotGame>(T_ISlotGame).gameParams;
        this.view.setLinesWays(
          this._waysCount == 0
            ? Math.pow(gameParams.maxIconsPerGroup, gameParams.groupsCount)
            : this._waysCount,
          'ways_count'
        );
      }
    } else {
      this.view.setLinesWays(this._session.currentLine, 'lines_count');
    }
  }

  private setTotalWin(totalWin: number): void {
    this.view.SetTotalWin(totalWin);
  }

  private resetWinState(): void {
    this.view.ResetWinState();
  }

  private stopActionsOnAccelerate(): void {
    this.view.StopActionsOnAccelerate();
  }

  private addTotalWin(totalWin: number, currentWin: number): void {
    this.view.AddTotalWin(totalWin, currentWin);
  }

  private addCurrentWin(totalWin: number, currentWin: number): void {
    this.view.AddCurrentWin(totalWin, currentWin);
  }

  public OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Scatter:
        if (
          this._stateMachine.curResponse.isFreeSpins &&
          this._stateMachine.curResponse.freeSpinsInfo!.event ==
            FreeSpinsInfoConstants.FreeSpinsStarted &&
          (!this._stateMachine.prevResponse ||
            !this._stateMachine.prevResponse.isFreeSpins ||
            this._stateMachine.prevResponse.freeSpinsInfo!.event ==
              FreeSpinsInfoConstants.FreeSpinsFinished)
        ) {
          this.stopActionsOnAccelerate();
          this._session.SetTotalWin(0);
        }
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this.stopActionsOnAccelerate();
        break;
      case GameStateMachineStates.Bonus:
        if (this._stateMachine.curResponse.isFreeSpins) {
          this._session.AddTotalWin(
            this._stateMachine.curResponse.freeSpinsInfo!.totalWin,
            this._stateMachine.curResponse.totalWin
          );
        } else {
          this._session.SetTotalWin(this._stateMachine.curResponse.totalWin);
        }
        break;
      case GameStateMachineStates.BeginFreeSpinsPopup:
        if (
          this._session.GameId != '78' &&
          this._session.GameId != '122' &&
          this._stateMachine.curResponse.isFreeSpins &&
          this._stateMachine.curResponse.freeSpinsInfo!.event ==
            FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          this._session.SetTotalWin(0);
        }

        this.resetWinState();
        break;
    }
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BeginCollapse:
        const grp = this._stateMachine.curResponse.additionalData;
        if (grp) {
          if (
            !this._stateMachine.curResponse.isFreeSpins ||
            this._stateMachine.curResponse.freeSpinsInfo!.event ==
              FreeSpinsInfoConstants.FreeSpinsStarted
          ) {
            // const totalWin = grp.groups
            //   .take(grp.collapsingCounter + 1)
            //   .reduce((win, gr) => win + gr.roundWin, 0);

            const takenGroups = grp.groups.take(grp.collapsingCounter + 1) as any[];
            const totalWin = fold(takenGroups, 0, (win, gr) => win + gr.roundWin);

            this._session.SetTotalWin(totalWin);
          } else {
            let roundWin = 0.0;
            // grp.groups
            //   .skip(grp.collapsingCounter + 1)
            //   .forEach((round) => (roundWin += round.roundWin));

            const filteredGroups = grp.groups.slice(grp.collapsingCounter + 1) as any[];
            filteredGroups.forEach((round) => (roundWin += round.roundWin));

            const totalWin = this._stateMachine.curResponse.freeSpinsInfo!.totalWin - roundWin;
            const currentWin = grp.groups[grp.collapsingCounter].roundWin;
            this._session.AddTotalWin(totalWin, currentWin);
          }
        }
        break;
      case GameStateMachineStates.ShortWinLines:
        if (this._stateMachine.curResponse) {
          const respinGroup =
            this._stateMachine.curResponse.additionalData &&
            this._stateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
              ? (this._stateMachine.curResponse.additionalData as InternalRespinSpecGroup)
              : null;

          if (respinGroup && !respinGroup.respinStarted) {
            if (!respinGroup.respinStarted) {
              if (
                !this._stateMachine.curResponse.isFreeSpins ||
                this._stateMachine.curResponse.freeSpinsInfo!.event ==
                  FreeSpinsInfoConstants.FreeSpinsStarted
              ) {
                this._session.SetTotalWin(respinGroup.firstWin);
              } else {
                let roundWin = 0.0;
                respinGroup.groups
                  .slice(respinGroup.respinCounter)
                  .forEach((round) => (roundWin += round.roundWin));
                const totalWin = this._stateMachine.curResponse.freeSpinsInfo!.totalWin - roundWin;
                this._session.AddTotalWin(totalWin, respinGroup.firstWin);
              }
            } else if (respinGroup.respinCounter < respinGroup.groups.length) {
              this._session.SetTotalWin(respinGroup.currentRound.roundWin);
            }
          }

          const collapsingGroup =
            this._stateMachine.curResponse.additionalData &&
            this._stateMachine.curResponse.additionalData instanceof InternalCollapsingSpecGroup
              ? (this._stateMachine.curResponse.additionalData as InternalCollapsingSpecGroup)
              : null;
          if (collapsingGroup) {
            if (collapsingGroup.collapsingCounter === collapsingGroup.groups.length) {
              if (
                !this._stateMachine.curResponse.isFreeSpins ||
                this._stateMachine.curResponse.freeSpinsInfo!.event ==
                  FreeSpinsInfoConstants.FreeSpinsStarted
              ) {
                this._session.SetTotalWin(this._stateMachine.curResponse.totalWin);
              }
            } else {
              if (
                !this._stateMachine.curResponse.isFreeSpins ||
                this._stateMachine.curResponse.freeSpinsInfo!.event ==
                  FreeSpinsInfoConstants.FreeSpinsStarted
              ) {
                this._session.SetTotalWin(collapsingGroup.currentRound.roundWin);
              }
            }
            return;
          }

          if (
            !respinGroup ||
            (respinGroup.respinStarted &&
              respinGroup.respinCounter === respinGroup.groups.length &&
              !this._respinShowWinProvider)
          ) {
            if (
              this._stateMachine.curResponse.isFreeSpins &&
              this._stateMachine.curResponse.freeSpinsInfo!.event !=
                FreeSpinsInfoConstants.FreeSpinsStarted
            ) {
              if (respinGroup) {
                this._session.AddTotalWin(
                  this._stateMachine.curResponse.freeSpinsInfo!.totalWin,
                  this._stateMachine.curResponse.totalWin - respinGroup.firstWin
                );
              } else {
                this._session.AddTotalWin(
                  this._stateMachine.curResponse.freeSpinsInfo!.totalWin,
                  this._stateMachine.curResponse.totalWin
                );
              }
            } else {
              this._session.SetTotalWin(this._stateMachine.curResponse.totalWin);
            }
          }
        }
        break;
      case GameStateMachineStates.Respin:
        if (this._respinShowWinProvider) {
          if (this._stateMachine.curResponse) {
            const respinGroup =
              this._stateMachine.curResponse.additionalData &&
              this._stateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
                ? (this._stateMachine.curResponse.additionalData as InternalRespinSpecGroup)
                : null;

            if (respinGroup) {
              if (!respinGroup.respinStarted) {
                this._session.SetTotalWin(respinGroup.firstWin);
              } else if (respinGroup.respinCounter < respinGroup.groups.length) {
                this._session.SetTotalWin(
                  respinGroup.groups[respinGroup.respinCounter - 1].roundWin
                );
              }
            }
          }
        }
        break;
      case GameStateMachineStates.RegularSpin:
        if (this._stateMachine.curResponse && this._hudCoordinator.updateTotalWinOnRegularSpins) {
          if (!this._stateMachine.curResponse.isFreeSpins) {
            this._session.SetTotalWin(this._stateMachine.curResponse.totalWin);
          }
        }
        break;
      case GameStateMachineStates.EndOfFreeSpins:
        const group =
          this._stateMachine.curResponse.additionalData instanceof InternalCollapsingSpecGroup
            ? (this._stateMachine.curResponse.additionalData as InternalCollapsingSpecGroup)
            : null;
        if (!group) {
          if (this._stateMachine.curResponse.freeSpinsInfo) {
            this._session.AddTotalWin(
              this._stateMachine.curResponse.freeSpinsInfo.totalWin,
              this._stateMachine.curResponse.totalWin
            );
          }
        }
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this._session.SetTotalWin(this._stateMachine.curResponse.freeSpinsInfo!.totalWin);
        break;
      case GameStateMachineStates.BeginBonus:
      case GameStateMachineStates.BeginFreeSpins:
      case GameStateMachineStates.BeginScatter:
        if (
          this._stateMachine.curResponse.isFreeSpins &&
          this._stateMachine.curResponse.freeSpinsInfo!.event !=
            FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          this._session.AddTotalWin(
            this._stateMachine.curResponse.freeSpinsInfo!.totalWin,
            this._stateMachine.curResponse.totalWin
          );
        } else {
          if (this._stateMachine.curResponse && !this._hudCoordinator.updateTotalWinAfterScatter) {
            if (
              this._stateMachine.curResponse.isFreeSpins &&
              this._stateMachine.curResponse.freeSpinsInfo!.event ==
                FreeSpinsInfoConstants.FreeSpinsStarted &&
              this._stateMachine.curResponse.freeSpinReBuyInfo
            ) {
              this._session.SetTotalWin(0);
            } else {
              this._session.SetTotalWin(this._stateMachine.curResponse.totalWin);
            }
          }
        }
        break;
      case GameStateMachineStates.Accelerate:
        if (
          this._stateMachine.curResponse.isFreeSpins &&
          !this._stateMachine.curResponse.isRespin &&
          this._stateMachine.curResponse.freeSpinsInfo!.event ==
            FreeSpinsInfoConstants.FreeSpinsFinished
        ) {
          this._session.SetTotalWin(0);
        } else if (
          !this._stateMachine.curResponse.isRespin &&
          this._stateMachine.curResponse.isFreeSpins &&
          this._stateMachine.curResponse.freeSpinsInfo!.event !=
            FreeSpinsInfoConstants.FreeSpinsFinished
        ) {
          this.resetWinState();
        }
        this.stopActionsOnAccelerate();
        break;
      case GameStateMachineStates.WaitAccelerationComplete:
        this.stopActionsOnAccelerate();
        if (
          !this._stateMachine.curResponse.isRespin &&
          (!this._stateMachine.curResponse.isFreeSpins ||
            this._stateMachine.curResponse.freeSpinsInfo!.event ==
              FreeSpinsInfoConstants.FreeSpinsStarted)
        ) {
          this._session.SetTotalWin(0);
        } else {
          this.resetWinState();
        }
        break;
    }
  }
}
