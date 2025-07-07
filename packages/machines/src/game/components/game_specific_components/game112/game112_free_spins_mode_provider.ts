import { ISpinResponse } from '@cgs/common';
import { StringUtils } from '@cgs/shared';
import { SceneObject, Container } from '@cgs/syd';
import { IFreeSpinsModeProvider } from '../../free_spins/i_free_spins_mode_provider';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../../game_state_machine_notifier_component';
import { ResourcesComponent } from '../../resources_component';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../../reels_engine/state_machine/game_state_machine';
import {
  T_IGameStateMachineProvider,
  T_ResourcesComponent,
  T_GameStateMachineNotifierComponent,
} from '../../../../type_definitions';

export class Game112FreeSpinsModeProvider implements IFreeSpinsModeProvider, AbstractListener {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _root: SceneObject;
  private _modeNameFormat: string;
  private _modePickerNodeName: string;
  private _defaultModePickerName: string;
  private _recoveryAnimNodes: string[];
  private _groupMarker: string;
  private _allViews: string[];

  get AllViews(): string[] {
    return this._allViews;
  }
  get modePickerId(): string {
    return this._modePickerNodeName;
  }
  get groupMarker(): string {
    return this._groupMarker;
  }

  currentMode: string;

  constructor(
    container: Container,
    modePickerNodeName: string,
    modeNameFormat: string,
    allViews: string[] | null = null
  ) {
    this._gameStateMachine = (
      container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    const resourceComponent: ResourcesComponent = container.forceResolve<ResourcesComponent>(
      T_ResourcesComponent
    ) as ResourcesComponent;
    this._root = resourceComponent.root;
    this._modeNameFormat = modeNameFormat;
    this._modePickerNodeName = modePickerNodeName;
    // this._groupMarker = groupMarker;
    this._allViews = allViews as string[];

    const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ) as GameStateMachineNotifierComponent;
    notifierComponent.notifier.AddListener(this);
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BeginFreeSpins:
        this.setMode(this._gameStateMachine.curResponse.freeSpinsInfo!.name);
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        this.setMode(this._gameStateMachine.curResponse.freeSpinsInfo!.name);
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        const nodes = this._root.findAllById(this._modePickerNodeName);

        for (const node of nodes) {
          node.stateMachine!.switchToState('default');
        }
        break;
    }
  }

  setMode(symbolId: string): void {
    this.currentMode = StringUtils.format(this._modeNameFormat, [symbolId]);

    const nodes = this._root.findAllById(this._modePickerNodeName);
    for (const node of nodes) {
      node.stateMachine!.switchToState(this.currentMode);
    }
  }
}
