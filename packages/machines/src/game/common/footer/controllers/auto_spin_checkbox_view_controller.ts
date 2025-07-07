import { Container } from '@cgs/syd';
import { BaseSlotController } from '../../base_slot_controller';
import { SlotSession } from '../../slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { ISpinParams } from '../../../../reels_engine/game_components/i_spin_params';
import {
  T_ISlotSessionProvider,
  T_ISpinParams,
  T_ISpinController,
  T_IHudCoordinator,
} from '../../../../type_definitions';
import { IHudCoordinator } from '../i_hud_coordinator';
import { ISpinController } from '../i_spin_controller';
import { AutospinCheckboxMachineListener } from '../listeners/autospin_checkbox_machine_listener';
import { EmptyAutoSpinCheckboxView } from '../views/auto_spin_checkbox_view';
import { SpinController } from './spin_controller';

export class AutoSpinCheckboxController extends BaseSlotController<EmptyAutoSpinCheckboxView> {
  private _slotSession: SlotSession;
  private _spinViewController: SpinController;
  private _spinParams: ISpinParams;

  constructor(view: EmptyAutoSpinCheckboxView, container: Container) {
    super(container, view);
    view.clicked.listen((e) => this.onClicked());
    this._slotSession = (
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider) as ISlotSessionProvider
    ).slotSession;
    this._spinParams = container.forceResolve<ISpinParams>(T_ISpinParams) as ISpinParams;
    this._spinViewController = container.forceResolve<ISpinController>(
      T_ISpinController
    ) as SpinController;
    const hudCoordinator = container.forceResolve<IHudCoordinator>(
      T_IHudCoordinator
    ) as IHudCoordinator;
    hudCoordinator.available.listen((e) => this.onHudAvailable());
    hudCoordinator.unavailable.listen((e) => this.onHudUnavailable());
    hudCoordinator.hudEnable.listen((e) => this.onHudAvailable());
    hudCoordinator.hudDisable.listen((e) => this.onHudUnavailable());
    const listener = new AutospinCheckboxMachineListener(container);
    listener.viewController = this;
    this.gameStateMachineNotifier.notifier.AddListener(listener);
  }

  enable(): void {
    this._spinParams.autoSpin = true;
    this.view.checked();
  }

  disable(): void {
    this._spinParams.autoSpin = false;
    this.view.unchecked();
  }

  onClicked(): void {
    this._spinParams.autoSpin = !this._spinParams.autoSpin;
    this._spinViewController.spinClicked();
  }

  onHudUnavailable(): void {
    this.view.disableButton();
  }

  onHudAvailable(): void {
    this.enableCheckbox();
  }

  enableCheckbox(): void {
    this.view.enableButton();
  }
}
