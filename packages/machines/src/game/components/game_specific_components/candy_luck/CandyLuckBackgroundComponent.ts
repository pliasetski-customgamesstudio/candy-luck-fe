import {
  AbstractListener,
  GameStateMachineNotifierComponent,
  GameStateMachineStates,
  T_GameStateMachineNotifierComponent,
} from '@cgs/machines';
import { Container } from '@cgs/syd';

enum BackgroundColor {
  Default = '#f4d4d9',
  FreeSpins = '#d18dd9',
}

export const T_CandyLuckBackgroundComponent = Symbol('T_CandyLuckBackgroundComponent');

export class CandyLuckBackgroundComponent implements AbstractListener {
  private readonly body: HTMLElement;

  constructor(container: Container) {
    this.body = document.body;

    const notifierComponent = container.resolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    notifierComponent?.notifier.AddListener(this);
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Idle:
      case GameStateMachineStates.Bonus:
        this.setState(BackgroundColor.Default);
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this.setState(BackgroundColor.FreeSpins);
        break;
    }
  }

  public OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BeginFreeSpinsPopup:
        this.setState(BackgroundColor.FreeSpins);
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.setState(BackgroundColor.Default);
        break;
    }
  }

  private setState(color: BackgroundColor): void {
    this.body.style.backgroundColor = color;
  }
}
