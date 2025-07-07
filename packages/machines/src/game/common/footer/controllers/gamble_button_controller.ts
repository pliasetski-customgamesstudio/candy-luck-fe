import { Container } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { GameStateMachineNotifierComponent } from '../../../components/game_state_machine_notifier_component';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { IHudCoordinator } from '../i_hud_coordinator';
import { BaseListener } from '../listeners/base_listener';
import { GambleButtonListener } from '../listeners/gamble_button_listener';
import { GambleButtonView } from '../views/gamble_button_view';
import { ISpinResponse, InternalCollapsingSpecGroup, InternalRespinSpecGroup } from '@cgs/common';
import {
  T_GameStateMachineNotifierComponent,
  T_IHudCoordinator,
} from '../../../../type_definitions';

export class GambleButtonController extends BaseSlotController<GambleButtonView> {
  private _stateMachine: GameStateMachine<ISpinResponse>;
  private _isGambleStarted: boolean = false;
  private _stateMachineListener: BaseListener<GambleButtonController>;

  constructor(container: Container, view: GambleButtonView) {
    super(container, view);
    this._stateMachine = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ).gameStateMachine;
    this._stateMachineListener = new GambleButtonListener(container, this);
    const hudCoordinator: IHudCoordinator =
      container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    hudCoordinator.available.listen((e) => this._onHudAvailable());
    hudCoordinator.unavailable.listen((e) => this._onHudUnavailable());
    hudCoordinator.hudEnable.listen((e) => this._onHudAvailable());
    hudCoordinator.hudDisable.listen((e) => this._onHudUnavailable());
  }

  private _onHudAvailable(): void {
    this.showGambleIfAvailable();
  }

  private _onHudUnavailable(): void {
    this.hideGambleButton();
  }

  private showGambleIfAvailable(): void {
    if (this.isGambleAvailable) {
      this.view.showGamble();
    }
  }

  private hideGambleButton(): void {
    if (this.view.isShown()) {
      this.view.hideGamble();
    }
  }

  public onGambleButtonClicked(): void {
    this._stateMachine.doStartGamble();
    this.hideGambleButton();
  }

  private get isGambleAvailable(): boolean {
    const additionalData = this._stateMachine.curResponse.additionalData;
    if (
      additionalData &&
      additionalData instanceof InternalCollapsingSpecGroup &&
      additionalData.collapsingCounter < additionalData.groups.length
    ) {
      return false;
    }
    if (
      additionalData &&
      additionalData instanceof InternalRespinSpecGroup &&
      additionalData.respinCounter < additionalData.groups.length
    ) {
      return false;
    }
    return (
      this._stateMachine.curResponse.totalWin > 0 &&
      !this._isGambleStarted &&
      !this._stateMachine.curResponse.freeSpinsInfo &&
      !this._stateMachine.curResponse.scatterInfo
    );
  }

  public onGambleStarted(): void {
    this._isGambleStarted = true;
    this.view.resetAnimation();
  }

  public onSpinStarted(): void {
    this._isGambleStarted = false;
  }
}
