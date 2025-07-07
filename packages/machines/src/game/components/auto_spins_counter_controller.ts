import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { BitmapTextSceneObject, Container } from '@cgs/syd';
import { ISpinParams } from '../../reels_engine/game_components/i_spin_params';
import {
  T_GameStateMachineNotifierComponent,
  T_IGameStateMachineProvider,
  T_ISpinParams,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ResourcesComponent } from './resources_component';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class AutoSpinsCounterController implements AbstractListener {
  private _count: number;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _autoSpinCounter: BitmapTextSceneObject;
  private _spinParams: ISpinParams;
  public unlimitedSpins: boolean;

  constructor(container: Container) {
    this._autoSpinCounter = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .footer.findById('autoSpinCounter') as BitmapTextSceneObject;
    this._spinParams = container.forceResolve<ISpinParams>(T_ISpinParams);
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    container
      .forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent)
      .notifier.AddListener(this);
    this.unlimitedSpins = false;
  }

  get count(): number {
    return this._count;
  }

  set count(value: number) {
    this._count = value;
    if (this._count > 0) {
      this._autoSpinCounter.text = this._count.toString();
    } else if (this._count == 0) {
      this._autoSpinCounter.text = '';
    } else {
      this._autoSpinCounter.text = '∞';
    }
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.onAccelerateEntered();
        break;
      case GameStateMachineStates.Stop:
        this.onStopEntered();
        break;
      default:
        break;
    }
  }

  public OnStateExited(slotState: string): void {}

  private onAccelerateEntered(): void {
    if (
      this._spinParams.autoSpin &&
      (!this._gameStateMachine.curResponse.isFreeSpins ||
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished) &&
      !this._gameStateMachine.curResponse.isRespin
    ) {
      this.count--;
    }
  }

  private onStopEntered(): void {
    if (
      this._spinParams.autoSpin &&
      (!this._gameStateMachine.curResponse.isFreeSpins ||
        this._gameStateMachine.curResponse.freeSpinsInfo!.event ==
          FreeSpinsInfoConstants.FreeSpinsFinished)
    ) {
      if (this.count == 0) {
        this._spinParams.autoSpin = false;
        this.unlimitedSpins = false;
      }
    }
  }
}
