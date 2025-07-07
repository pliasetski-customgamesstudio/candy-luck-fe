import { Container, SceneObject } from '@cgs/syd';
import { ResourcesComponent } from '../resources_component';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_GameStateMachineNotifierComponent,
  T_IGameStateMachineProvider,
  T_ResourcesComponent,
} from '../../../type_definitions';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from '../game_state_machine_notifier_component';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../reels_engine/state_machine/game_state_machine';
import { StringUtils } from '@cgs/shared';
import { IFreeSpinsModeProvider } from './i_free_spins_mode_provider';
import { ISpinResponse } from '@cgs/common';

export class FreeSpinsModeProvider implements IFreeSpinsModeProvider, AbstractListener {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _root: SceneObject;

  private _modeNameFormat: string | null;
  private _modePickerNodeName: string | null;
  private _defaultModePickerName: string | null;
  private _recoveryAnimNodes: string[] | null;
  private _groupMarker: string | null;
  private _allViews: string[] | null;

  get AllViews(): string[] | null {
    return this._allViews;
  }
  get modePickerId(): string | null {
    return this._modePickerNodeName;
  }
  get groupMarker(): string | null {
    return this._groupMarker;
  }

  currentMode: string | null;

  constructor(
    container: Container,
    modePickerNodeName: string | null,
    defaultModePickerName: string | null,
    recoveryAnimNodes: string[] | null,
    modeNameFormat: string | null,
    groupMarker: string,
    allViews?: string[]
  ) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const resourceComponent: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._root = resourceComponent.root;
    this._modeNameFormat = modeNameFormat;
    this._modePickerNodeName = modePickerNodeName;
    this._recoveryAnimNodes = recoveryAnimNodes;
    this._defaultModePickerName = defaultModePickerName;
    this._groupMarker = groupMarker;
    this._allViews = allViews ?? null;

    const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    notifierComponent.notifier.AddListener(this);
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.FreeSpinRecovery:
        const group = this._gameStateMachine.curResponse.specialSymbolGroups!.filter(
          (s) => s.type === this._groupMarker
        );

        if (group.length !== 0) {
          this.setMode(group[0].symbolId!.toString());

          for (const recoveryAnimNode of this._recoveryAnimNodes!) {
            const node = this._root.findById(recoveryAnimNode);

            if (node) {
              node.stateMachine!.switchToState('anim');
            }
          }
        }
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        const nodes = this._root.findAllById(this._defaultModePickerName!);

        for (const node of nodes) {
          node.stateMachine!.switchToState('global_default');
        }
        break;
    }
  }

  setMode(symbolId: string): void {
    this.currentMode = StringUtils.format(this._modeNameFormat!, [symbolId]);

    const nodes = this._root.findAllById(this._modePickerNodeName!);
    for (const node of nodes) {
      node.stateMachine!.switchToState(this.currentMode);
    }
  }
}
