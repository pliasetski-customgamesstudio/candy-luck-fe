import { Container, SceneObject } from '@cgs/syd';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../game_state_machine_notifier_component';
import { ResourcesComponent } from '../../resources_component';
import {
  T_GameStateMachineNotifierComponent,
  T_ResourcesComponent,
} from '../../../../type_definitions';
import { GameStateMachineStates } from '../../../../reels_engine/state_machine/game_state_machine';

interface BackgroundComponentParams {
  sceneId?: string;
  states?: {
    default?: string;
    freeSpins?: string;
    defaultToFreeSpins?: string;
    freeSpinsToDefault?: string;
  };
}

const defaultParams: BackgroundComponentParams = {
  sceneId: 'BG_Modes',
  states: {
    default: 'bg_default',
    freeSpins: 'bg_fs',
    defaultToFreeSpins: 'bg_default_to_fs',
    freeSpinsToDefault: 'bg_fs_to_default',
  },
};

export const T_CandyLuckBackgroundModeComponent = Symbol('CandyLuckBackgroundModeComponent');

export class CandyLuckBackgroundModeComponent implements AbstractListener {
  private _backgroundModesScene: SceneObject | null;

  constructor(
    container: Container,
    private readonly params?: BackgroundComponentParams
  ) {
    const resourceComponent: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._backgroundModesScene = resourceComponent.bg.findById(
      params?.sceneId || defaultParams.sceneId!
    );

    const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    notifierComponent.notifier.AddListener(this);
  }

  public OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.FreeSpinRecovery:
        this.setState(this.params?.states?.freeSpins || defaultParams.states!.freeSpins!);
        break;
    }
  }

  public OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BeginFreeSpinsPopup:
        this.setState(
          this.params?.states?.defaultToFreeSpins || defaultParams.states!.defaultToFreeSpins!
        );
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.setState(
          this.params?.states?.freeSpinsToDefault || defaultParams.states!.freeSpinsToDefault!
        );
        break;
    }
  }

  private setState(state: string): void {
    this._backgroundModesScene?.stateMachine?.switchToState(state);
  }
}
