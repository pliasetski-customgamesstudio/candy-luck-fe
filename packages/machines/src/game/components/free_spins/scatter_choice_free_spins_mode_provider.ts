import { FreeSpinsModeProvider } from './free_spins_mode_provider';
import { GameStateMachineStates } from '../../../reels_engine/state_machine/game_state_machine';

export class ScatterChoiceFreeSpinsModeProvider extends FreeSpinsModeProvider {
  constructor(container: any, groupMarker: string, allViews?: string[]) {
    super(container, null, null, null, null, groupMarker, allViews);
  }

  setMode(mode: string | null): void {
    this.currentMode = mode;
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.FreeSpinRecovery:
        const group = this.gameStateMachine.curResponse.specialSymbolGroups!.filter(
          (s) => s.type === this.groupMarker
        );

        if (group.length !== 0) {
          this.setMode(group[0].symbolId!.toString());
        }
        break;
      case GameStateMachineStates.Scatter:
        this.setMode(null);
        break;
    }
  }

  OnStateExited(_slotState: string): void {
    // Skip
  }
}
