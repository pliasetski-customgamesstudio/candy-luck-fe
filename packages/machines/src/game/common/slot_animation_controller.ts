import { Container } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../components/game_state_machine_notifier_component';
import { ILogoAnimationProvider } from '../components/i_logo_animation_provider';
import { IFadeReelsProvider } from '../components/win_lines/i_fade_reels_provider';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_GameStateMachineNotifierComponent,
  T_IFadeReelsProvider,
  T_ILogoAnimationProvider,
} from '../../type_definitions';

export abstract class ISlotAnimationController implements AbstractListener {
  abstract OnStateEntered(slotState: string): void;
  abstract OnStateExited(slotState: string): void;
  abstract attachChangesOnStateEntered(slotState: string): void;
  abstract attachChangesOnStateExited(slotState: string): void;
}

export class SlotAnimationController implements ISlotAnimationController {
  private _container: Container;
  private _stateMachine: GameStateMachine<any>;
  private _logoAnimationProvider: ILogoAnimationProvider | null;

  constructor(container: Container) {
    this._container = container;
    this._stateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._logoAnimationProvider =
      this._container.resolve<ILogoAnimationProvider>(T_ILogoAnimationProvider) ?? null;
    const notifierComponent: GameStateMachineNotifierComponent =
      this._container.forceResolve<GameStateMachineNotifierComponent>(
        T_GameStateMachineNotifierComponent
      );
    notifierComponent.notifier.AddListener(this);
  }

  attachChangesOnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Accelerate:
        this.OnAccelerateEntered();
        this.StopLogoAnimation();
        break;
      case GameStateMachineStates.Collapse:
        this.DisableFade();
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.OnEndFreeSpinsPopup();
        break;
      case GameStateMachineStates.Bonus:
        this.OnBonusEntered();
        break;
    }
  }

  attachChangesOnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
        this.OnBonusExited();
        this.DisableFade();
        break;
      /*case GameStateMachineStates.VerifyBalance:
        this.DisableFade();
        break;*/
      case GameStateMachineStates.Scatter:
        this.DisableFade();
        break;
    }
  }

  OnStateEntered(slotState: string): void {
    this.attachChangesOnStateEntered(slotState);
  }

  OnStateExited(slotState: string): void {
    this.attachChangesOnStateExited(slotState);
  }

  private OnAccelerateEntered(): void {
    this.DisableFade();
  }

  private OnEndFreeSpinsPopup(): void {
    this.DisableFade();
  }

  private OnBonusEntered(): void {
    if (!this._stateMachine.curResponse.isFreeSpins) {
      this.DisableFade();
    }
  }

  private OnBonusExited(): void {
    if (!this._stateMachine.curResponse.isFreeSpins) {
      this.DisableFade();
    }
  }

  private DisableFade(): void {
    this._container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider).EnableFade(false);
  }

  private StopLogoAnimation(): void {
    if (this._logoAnimationProvider && !this._stateMachine.curResponse.freeSpinsInfo) {
      this._logoAnimationProvider.stopLogoAnimation();
    }
  }
}
