import { ISpinResponse } from '@cgs/common';
import { Container } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import { BaseGameState } from '../../reels_engine/state_machine/states/base_game_state';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export interface AbstractListener {
  OnStateEntered(slotState: string): void;
  OnStateExited(slotState: string): void;
}

export abstract class SlotNotifier {
  abstract AddListener(listener: AbstractListener): void;
  abstract RemoveListener(listener: AbstractListener): void;
  abstract NotifyListenersEntered(slotState: string): void;
  abstract NotifyListenersExited(slotState: string): void;
}

export class GameStateMachineNotifierComponent {
  notifier: GameStateMachineNotifier;
  gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    this.notifier = new GameStateMachineNotifier();
    this.gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    for (const state of this.gameStateMachine.rootState.states
      .map((entry) => entry.state as BaseGameState<ISpinResponse>)
      .filter((state) => !!state)) {
      state.entered.listen(() => {
        this.notifier.NotifyListenersEntered(state.id);
      });
      state.leaved.listen(() => {
        this.notifier.NotifyListenersExited(state.id);
      });
    }
  }
}

export class GameStateMachineNotifier extends SlotNotifier {
  private _listeners: AbstractListener[] = [];

  AddListener(listener: AbstractListener) {
    this._listeners.push(listener);
  }

  RemoveListener(listener: AbstractListener) {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  NotifyListenersEntered(slotState: string) {
    for (const listener of this._listeners) {
      listener.OnStateEntered(slotState);
    }
  }

  NotifyListenersExited(slotState: string) {
    for (const listener of this._listeners) {
      listener.OnStateExited(slotState);
    }
  }
}

export class StateMachineListener implements AbstractListener {
  private _container: Container;
  get container(): Container {
    return this._container;
  }
  private _stateMachine: GameStateMachine<ISpinResponse>;
  get stateMachine(): GameStateMachine<ISpinResponse> {
    return this._stateMachine;
  }

  constructor(container: Container) {
    this._container = container;
    this._stateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  onInitEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onAccelerateEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onImmediatelyStopEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onWaitRequestEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onWaitRequestExited(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onEndFreeSpinsPopupEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onEndFreeSpinsPopupExited(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onBonusEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onEndBonusEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onScatterEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onStopEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onBeginFreeSpinsEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onFreeSpinRecoveryEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onBeginFreeSpinsPopupEntered(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  OnStateEntered(slotState: string) {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.onAccelerateEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.Bonus:
        this.onBonusEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.EndBonus:
        this.onEndBonusEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.Scatter:
        this.onScatterEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.Stop:
        this.onStopEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.BeginFreeSpins:
        this.onBeginFreeSpinsEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this.onFreeSpinRecoveryEntered(
          this.stateMachine.curResponse,
          this.stateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.ImmediatelyStop:
        this.onImmediatelyStopEntered(
          this.stateMachine.curResponse,
          this.stateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.InitGame:
        this.onInitEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.WaitRequest:
        this.onWaitRequestEntered(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.onEndFreeSpinsPopupEntered(
          this.stateMachine.curResponse,
          this.stateMachine.prevResponse
        );
        break;
      case GameStateMachineStates.BeginFreeSpinsPopup:
        this.onBeginFreeSpinsPopupEntered(
          this.stateMachine.curResponse,
          this.stateMachine.prevResponse
        );
        break;
    }
  }

  OnStateExited(slotState: string) {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
        this.onBonusExited(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.Animation:
        this.onAnimationExited(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.EndScatter:
        this.onEndScatterExited(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.WaitRequest:
        this.onWaitRequestExited(this.stateMachine.curResponse, this.stateMachine.prevResponse);
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.onEndFreeSpinsPopupExited(
          this.stateMachine.curResponse,
          this.stateMachine.prevResponse
        );
        break;
    }
  }

  onAnimationExited(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onBonusExited(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}

  onEndScatterExited(_currentResponse: ISpinResponse, _previousResponse: ISpinResponse) {}
}
