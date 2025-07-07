import {
  IClientProperties,
  IAuthorizationHolder,
  T_IClientProperties,
  ISpinResponse,
  T_IAuthorizationHolder,
} from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import {
  Action,
  EventDispatcher,
  Container,
  SequenceSimpleAction,
  EmptyAction,
  IntervalAction,
  EventStream,
} from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import { EpicWinConfiguration } from '../../../components/epic_win/epic_win_configuration';
import { GameTimeAccelerationProvider } from '../../../components/game_time_acceleration_provider';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { IBonusSharer, T_IBonusSharer } from '../../../../i_bonus_sharer';
import { LobbyFacade } from '../../../../lobby_facade';
import { AwaitableAction } from '../../../../reels_engine/actions/awaitable_action';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_LobbyFacade,
  T_ISlotSessionProvider,
  T_IGameStateMachineProvider,
  T_GameTimeAccelerationProvider,
} from '../../../../type_definitions';
import { EpicWinPopupView } from '../views/epic_win_popup_view';
import { BaseSlotPopupController } from './base_popup_controller';

export class EpicWinPopupController extends BaseSlotPopupController<EpicWinPopupView> {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _configuration: EpicWinConfiguration;
  get configuration(): EpicWinConfiguration {
    return this._configuration;
  }
  private _lazyAction: Action;
  get lazyAction(): Action {
    return this._lazyAction;
  }
  set lazyAction(value: Action) {
    this._lazyAction = value;
  }
  private _fastSpinsController: GameTimeAccelerationProvider;
  get fastSpinsController(): GameTimeAccelerationProvider {
    return this._fastSpinsController;
  }
  private _slotSession: SlotSession;
  get slotSession(): SlotSession {
    return this._slotSession;
  }
  private _clientProperties: IClientProperties;
  get clientProperties(): IClientProperties {
    return this._clientProperties;
  }
  // private _flowCoordinator: IFlowCoordinator;
  private _prepurchaseFrequency: number = 0;
  private _sharer: IBonusSharer;
  get sharer(): IBonusSharer {
    return this._sharer;
  }
  private _startAfterShortWinLines: boolean = false;
  private _authorizationHolder: IAuthorizationHolder;
  get authorizationHolder(): IAuthorizationHolder {
    return this._authorizationHolder;
  }

  private _epicWinClosedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  get epicWinClosedDispatcher(): EventDispatcher<void> {
    return this._epicWinClosedDispatcher;
  }
  get epicWinClosed(): EventStream<void> {
    return this._epicWinClosedDispatcher.eventStream;
  }

  get bigWinName(): string {
    return this.gameStateMachineNotifier.gameStateMachine.curResponse.bigWinName
      .replaceAll(' ', '')
      .toLowerCase();
  }

  constructor(
    container: Container,
    popupView: EpicWinPopupView,
    configuration: EpicWinConfiguration,
    stopBackgroundSound: boolean,
    startAfterShortWinLines: boolean
  ) {
    super(container, popupView, stopBackgroundSound);
    this._configuration = configuration;
    this._authorizationHolder = container
      .forceResolve<LobbyFacade>(T_LobbyFacade)
      .resolve(T_IAuthorizationHolder) as IAuthorizationHolder;
    // this._flowCoordinator = container.resolve(IFlowCoordinator);
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._startAfterShortWinLines = startAfterShortWinLines;
    this.initSubscriptions();
    this._sharer = container.forceResolve<IBonusSharer>(T_IBonusSharer);
    this._fastSpinsController = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
  }

  protected initSubscriptions(): void {
    this._lazyAction = new LazyAction(() =>
      this.popupAction(this.gameStateMachineNotifier.gameStateMachine.curResponse)
    );
    if (this._startAfterShortWinLines) {
      this.gameStateMachineNotifier.gameStateMachine.shortWinLines.appendLazyAnimation(
        () => this._lazyAction
      );
      this.gameStateMachineNotifier.gameStateMachine.shortWinLines.appendLazyAnimation(() =>
        this.getPrepurchaseTurboWinPopup(this.gameStateMachineNotifier.gameStateMachine.curResponse)
      );
    } else {
      this.gameStateMachineNotifier.gameStateMachine.animation.appendLazyAnimation(
        () => this._lazyAction
      );
      this.gameStateMachineNotifier.gameStateMachine.animation.appendLazyAnimation(() =>
        this.getPrepurchaseTurboWinPopup(this.gameStateMachineNotifier.gameStateMachine.curResponse)
      );
    }
  }

  onPopupClosed(): void {
    if (!this._lazyAction.isFinished) {
      this._lazyAction.end();
    }
    if (this.view.isShareChecked) {
      this._sharer.shareEpicWin();
    }

    this.view.resetShare();

    this._epicWinClosedDispatcher.dispatchEvent();

    super.onPopupClosed();
  }

  popupAction(response: ISpinResponse): Action {
    if (this.isBigWin(response)) {
      const totalWin = this._gameStateMachine.curResponse.totalWin;
      const specialSymbolGroup = this._gameStateMachine.curResponse.specialSymbolGroups!.find(
        (g) => g.type === 'bigWinTotalWin'
      );
      if (specialSymbolGroup) {
        const _totalJackPotWin = specialSymbolGroup.totalJackPotWin;
      }
      return new SequenceSimpleAction([
        this.view.showWinAction(this.bigWinName, totalWin),
        new AwaitableAction(this.view.show()),
      ]);
    }
    return new EmptyAction();
  }

  protected isBigWin(response: ISpinResponse): boolean {
    const winName = response.bigWinName;
    if (winName) {
      const filteredSteps = this._configuration.steps.filter(
        (step) => step.winName === this.bigWinName
      );
      if (filteredSteps.length > 0) {
        return true;
      }
    }
    return false;
  }

  protected getPrepurchaseTurboWinPopup(_response: ISpinResponse): IntervalAction {
    return new EmptyAction();
  }

  // private getTrigger(bigWinName: string): Trigger {
  //   var isFreeSpins = this._gameStateMachine.curResponse.isFreeSpins || this._gameStateMachine.curResponse.isScatter;
  //   var isBonus = this._gameStateMachine.curResponse.isBonus;
  //   var isFreeSpinsTrigger = isFreeSpins || isBonus;
  //   switch (bigWinName) {
  //     case "Big Win":
  //       return isFreeSpinsTrigger ? Trigger.FreeSpinsBigWin : Trigger.BigWin;
  //     case "Mega Win":
  //       return isFreeSpinsTrigger ? Trigger.FreeSpinsMegaWin : Trigger.MegaWin;
  //     case "Epic Win":
  //       return isFreeSpinsTrigger ? Trigger.FreeSpinsEpicWin : Trigger.EpicWin;
  //     default:
  //       return isFreeSpinsTrigger ? Trigger.FreeSpinsMegaWin : Trigger.MegaWin;
  //   }
  // }
}
