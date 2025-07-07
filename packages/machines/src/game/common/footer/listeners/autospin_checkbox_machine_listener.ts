import { ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../../components/game_state_machine_notifier_component';
import { ISpinParams } from '../../../../reels_engine/game_components/i_spin_params';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import { T_ISpinParams, T_GameStateMachineNotifierComponent } from '../../../../type_definitions';
import { AutoSpinCheckboxController } from '../controllers/auto_spin_checkbox_view_controller';

export class AutospinCheckboxMachineListener implements AbstractListener {
  private _spinParams: ISpinParams;
  public viewController: AutoSpinCheckboxController;
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _isFreeSpins: boolean = false;

  constructor(container: Container) {
    this._spinParams = container.forceResolve<ISpinParams>(T_ISpinParams);
    this._container = container;
    const stComponent = this._container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this._gameStateMachine = stComponent.gameStateMachine;
  }

  onAccelerateEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
    if (this._spinParams.autoSpin) {
      this.viewController.enable();
    } else if (
      currentResponse &&
      (currentResponse.freeSpinsInfo || currentResponse.isBonus || currentResponse.isScatter)
    ) {
      this.viewController.disable();
    }
  }

  onRegularSpinEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
    if (!this._spinParams.autoSpin) {
      this.viewController.disable();
    }
  }

  onBeginFreeSpinsEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
    this._isFreeSpins = true;
  }

  onStopExited(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
    if (!this._spinParams.autoSpin) {
      this.viewController.disable();
    }
  }

  onStoppingEntered(current: ISpinResponse, previous: ISpinResponse): void {
    if (current && !this._isFreeSpins) {
      this.viewController.enableCheckbox();
    }
  }

  onEndOfFreeSpinsExited(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
    this._isFreeSpins = false;
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.onAccelerateEntered(
          this._gameStateMachine.curResponse,
          this._gameStateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.Stopping:
        this.onStoppingEntered(
          this._gameStateMachine.curResponse,
          this._gameStateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.RegularSpin:
        this.onRegularSpinEntered(
          this._gameStateMachine.curResponse,
          this._gameStateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.BeginFreeSpins:
        this.onBeginFreeSpinsEntered(
          this._gameStateMachine.curResponse,
          this._gameStateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this.onBeginFreeSpinsEntered(
          this._gameStateMachine.curResponse,
          this._gameStateMachine.prevResponse
        );
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Stop:
        this.onStopExited(this._gameStateMachine.curResponse, this._gameStateMachine.prevResponse);
        break;
      case GameStateMachineStates.EndOfFreeSpins:
        this.onEndOfFreeSpinsExited(
          this._gameStateMachine.curResponse,
          this._gameStateMachine.prevResponse
        );
        break;
    }
  }
}
