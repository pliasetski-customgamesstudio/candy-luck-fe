import {
  IClientProperties,
  T_IClientProperties,
  SpinResponse,
  InternalCollapsingSpecGroup,
} from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import { Action, Container, EmptyAction, ParallelSimpleAction } from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import { GameTimeAccelerationProvider } from '../../../components/game_time_acceleration_provider';
import { PersonalJackpotCounterProvider } from '../../../components/personal_jackpot_counter_provider';
import { AwaitableAction } from '../../../../reels_engine/actions/awaitable_action';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import {
  T_GameTimeAccelerationProvider,
  T_PersonalJackpotCounterProvider,
  T_ISlotSessionProvider,
  T_RegularSpinsSoundModelComponent,
} from '../../../../type_definitions';
import { JackPotPopupView } from '../views/jackpot_popup_view';
import { BaseSlotPopupController } from './base_popup_controller';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { RegularSpinsSoundModelComponent } from '../../../components/regular_spins_sound_model_component';

export class JackPotWinPopupController extends BaseSlotPopupController<JackPotPopupView> {
  protected _reelsSoundModel: ReelsSoundModel;
  public static readonly jackpotMarker: string = 'JackPotWin';
  private _useTextAnimation: boolean;
  get useTextAnimation(): boolean {
    return this._useTextAnimation;
  }
  private _winPositionsSymbolId: number | null = null;
  get winPositionsSymbolId(): number {
    return this._winPositionsSymbolId as number;
  }
  private _soundName: string | null = null;
  get soundName(): string {
    return this._soundName as string;
  }
  protected _fastSpinsController: GameTimeAccelerationProvider;
  protected _slotSession: SlotSession;
  protected _clientProperties: IClientProperties;
  private _updateJackpotAtClose: boolean;
  get updateJackpotAtClose(): boolean {
    return this._updateJackpotAtClose;
  }
  private _jpAction: Action;
  get jpAction(): Action {
    return this._jpAction;
  }
  private _shortWinLineGroups: string[] | null = null;

  constructor(
    container: Container,
    popupView: JackPotPopupView,
    stopBackgroundSound: boolean,
    useTextAnimation: boolean,
    winPositionsSymbolId: number | null,
    soundName: string | null,
    updateJackpotAtClose: boolean,
    shortWinLineGroups: string[] | null = null
  ) {
    super(container, popupView, stopBackgroundSound);
    this._useTextAnimation = useTextAnimation;
    this._winPositionsSymbolId = winPositionsSymbolId;
    this._soundName = soundName;
    this._updateJackpotAtClose = updateJackpotAtClose;
    this._shortWinLineGroups = shortWinLineGroups;
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    this.gameStateMachineNotifier.gameStateMachine.stop.appendLazyAnimation(() =>
      this.buildOnStopPopupAction(
        this.gameStateMachineNotifier.gameStateMachine.curResponse as SpinResponse
      )
    );
    this.gameStateMachineNotifier.gameStateMachine.shortWinLines.addLazyAnimationToBegin(() =>
      this.buildOnShortWinLinesPopupAction(
        this.gameStateMachineNotifier.gameStateMachine.curResponse as SpinResponse
      )
    );
    // if (this.gameStateMachineNotifier.gameStateMachine instanceof CollapseGameStateMachine) {
    //   (this.gameStateMachineNotifier.gameStateMachine as CollapseGameStateMachine).endCollapseState.appendLazyAnimation(() =>
    //     this.buildOnEndCollapsePopupAction(this.gameStateMachineNotifier.gameStateMachine.curResponse)
    //   );
    // }
  }

  protected onPopupShown(): void {
    this.view.postEvent('default');
    this.view.postEvent('anim');

    if (this._soundName && this._soundName.length > 0) {
      const sound = this._reelsSoundModel.getSoundByName(this._soundName);
      sound.stop();
      sound.play();
    }
  }

  protected onPopupClosed(): void {
    if (this._jpAction) {
      this._jpAction.end();
    }
    if (this._updateJackpotAtClose) {
      const jackpotCounterProvider = this.container.forceResolve<PersonalJackpotCounterProvider>(
        T_PersonalJackpotCounterProvider
      );
      if (jackpotCounterProvider) {
        jackpotCounterProvider.resetJackpotValues();
      }
    }

    super.onPopupClosed();
  }

  onAnimCompleted(): void {
    this.view.hide();
    if (this._soundName && this._soundName.length > 0) {
      const sound = this._reelsSoundModel.getSoundByName(this._soundName);
      sound.stop();
    }
  }

  buildOnStopPopupAction(response: SpinResponse): Action {
    if (
      !(
        !this._shortWinLineGroups ||
        !response.specialSymbolGroups ||
        !this._shortWinLineGroups.some((g) =>
          response.specialSymbolGroups!.some((gr) => gr.type == g)
        )
      )
    ) {
      return new EmptyAction();
    }
    const collapsingGroup =
      response.additionalData instanceof InternalCollapsingSpecGroup
        ? response.additionalData
        : null;
    this._jpAction = this.jackPotAction(response);
    return !collapsingGroup ? this._jpAction : new EmptyAction();
  }

  buildOnShortWinLinesPopupAction(response: SpinResponse): Action {
    if (
      !this._shortWinLineGroups ||
      !response.specialSymbolGroups ||
      !this._shortWinLineGroups.some((g) =>
        response.specialSymbolGroups!.some((gr) => gr.type == g)
      )
    ) {
      return new EmptyAction();
    }
    const collapsingGroup =
      response.additionalData instanceof InternalCollapsingSpecGroup
        ? response.additionalData
        : null;
    this._jpAction = this.jackPotAction(response);
    return !collapsingGroup ? this._jpAction : new EmptyAction();
  }

  buildOnEndCollapsePopupAction(response: SpinResponse): Action {
    if (
      !response.additionalData ||
      !(response.additionalData instanceof InternalCollapsingSpecGroup)
    ) {
      return new EmptyAction();
    }
    const collapsingGroup =
      response.additionalData instanceof InternalCollapsingSpecGroup
        ? response.additionalData
        : null;
    this._jpAction = this.jackPotAction(response);
    return collapsingGroup && collapsingGroup.collapsingCounter === collapsingGroup.groups.length
      ? this._jpAction
      : new EmptyAction();
  }

  jackPotAction(response: SpinResponse): Action {
    const symbols = response.specialSymbolGroups;
    const symbol = symbols
      ? symbols.find((p) => p.type == JackPotWinPopupController.jackpotMarker)
      : null;
    if (symbol) {
      const popupActions: Action[] = [new LazyAction(() => new AwaitableAction(this.view.show()))];

      let totalJackpotWin = symbol.totalJackPotWin;
      if (
        this._winPositionsSymbolId !== null &&
        response.winPositions &&
        response.winPositions.length > 0
      ) {
        const winPositions = response.winPositions.filter(
          (wp) => wp.symbol === this._winPositionsSymbolId
        );
        totalJackpotWin += winPositions.map((wp) => wp.win).reduce((w1, w2) => w1 + w2);
        winPositions.forEach((wp) =>
          response.winPositions.splice(response.winPositions.indexOf(wp), 1)
        );
      }

      if (this._useTextAnimation) {
        popupActions.push(this.view.getAnimationAction(totalJackpotWin));
      } else {
        this.view.setTotalWin(totalJackpotWin);
      }

      return new ParallelSimpleAction(popupActions);
    }

    return new EmptyAction();
  }
}
