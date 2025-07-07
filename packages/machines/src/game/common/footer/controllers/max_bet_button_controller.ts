import {
  IClientProperties,
  ISimpleUserInfoHolder,
  ISpinResponse,
  GameTimer,
  T_ISimpleUserInfoHolder,
} from '@cgs/common';
import { IDisposable, Container, EventStreamSubscription } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { SlotSession } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotSessionProvider,
  T_IGameStateMachineProvider,
  T_IHudCoordinator,
} from '../../../../type_definitions';
import { IHudCoordinator } from '../i_hud_coordinator';
import { ISpinController } from '../i_spin_controller';
import { MaxBetButtonView } from '../views/max_bet_button_view';

export class MaxBetButtonController
  extends BaseSlotController<MaxBetButtonView>
  implements IDisposable
{
  MaxBetPlusTooltipShown: string = 'MAX_BET_PLUS_TOOLTIP_SHOWN';

  private _spinController: ISpinController;
  private _slotSession: SlotSession;
  private _clientProperties: IClientProperties;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  // private _flowCoordinator: IFlowCoordinator;

  private _isMaxBetAnimationEnabled: boolean = false;
  private _isMaxBetTooltipEnabled: boolean = false;
  private _isMaxBetPlusEnabled: boolean = false;

  private _gameTimer: GameTimer;
  private _tooltipActive: boolean = false;

  private _regularSpinSub: EventStreamSubscription<void>;
  private _autoSpinSub: EventStreamSubscription<void>;
  private _timerSubscription: EventStreamSubscription<void>;

  constructor(container: Container, view: MaxBetButtonView) {
    super(container, view);
    view.clicked.listen(() => this._onClicked());
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._userInfoHolder = container.forceResolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const hudCoordinator: IHudCoordinator =
      container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    hudCoordinator.available.listen(() => this._onHudAvailable());
    hudCoordinator.unavailable.listen(() => this._onHudUnavailable());
    hudCoordinator.hudEnable.listen(() => this._onHudAvailable());
    hudCoordinator.hudDisable.listen(() => this._onHudUnavailable());
  }

  private async _onClicked(): Promise<void> {
    this.view.showBetPanel();
  }

  private _onHudAvailable(): void {
    this.view.enableButton();
  }

  private _onHudUnavailable(): void {
    this.view.disableButton();
  }

  public dispose(): void {
    this._regularSpinSub?.cancel();
    this._autoSpinSub?.cancel();
    if (this._gameTimer) {
      this._gameTimer.stop();
      this._timerSubscription?.cancel();
    }
  }
}
