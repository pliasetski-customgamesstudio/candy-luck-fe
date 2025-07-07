import { SceneCommon } from '@cgs/common';
import { Container, SceneObject } from '@cgs/syd';
import { FreeSpinsLogoController } from '../common/slot/controllers/freeSpins_logo_controller';
import { GameStateMachineStates } from '../../reels_engine/state_machine/game_state_machine';
import {
  AbstractListener,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { ResourcesComponent } from './resources_component';
import {
  T_ISlotSessionProvider,
  T_GameStateMachineNotifierComponent,
  T_ResourcesComponent,
} from '../../type_definitions';

export class FreeSpinsLogoComponent {
  controller: FreeSpinsLogoController;

  constructor(container: Container, sceneCommon: SceneCommon, embededLogo: boolean = false) {
    this.setup(container, sceneCommon, embededLogo);
  }

  setup(container: Container, sceneCommon: SceneCommon, embededLogo: boolean) {
    console.log('load ' + this.constructor.name);
    const slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    );
    this.controller = new FreeSpinsLogoController(
      container,
      notifierComponent,
      slotSession,
      sceneCommon,
      embededLogo
    );
  }
}

export class FreeSpinElemetsProvider implements AbstractListener {
  private _elements: string[] = [];
  private _root: SceneObject;
  private _container: Container;

  get Root(): SceneObject {
    if (!this._root) {
      this._root = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    }

    return this._root;
  }

  constructor(container: Container, elements: string[]) {
    this._container = container;
    if (elements) {
      for (const element of elements) {
        this._elements.push(element);
      }
    }

    const notifier = this._container.forceResolve<GameStateMachineNotifierComponent>(
      T_GameStateMachineNotifierComponent
    ).notifier;
    notifier.AddListener(this);
  }

  FreeSpin() {
    for (const element of this._elements) {
      const sceneObjects = this.Root.findAllById(element);
      for (const so of sceneObjects) {
        so.stateMachine!.switchToState('fs');
      }
    }
  }

  RegularSpin() {
    for (const element of this._elements) {
      const sceneObjects = this.Root.findAllById(element);
      for (const so of sceneObjects) {
        if (so.stateMachine!.findById('regular')) {
          so.stateMachine!.switchToState('regular');
        } else {
          so.stateMachine!.switchToState('default');
        }
      }
    }
  }

  OnStateEntered(slotState: string) {
    switch (slotState) {
      case GameStateMachineStates.FreeSpinRecovery:
      case GameStateMachineStates.FreeSpin:
        this.FreeSpin();
        break;
      case GameStateMachineStates.Bonus:
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.RegularSpin();
        break;
      default:
        break;
    }
  }

  OnStateExited(slotState: string) {
    switch (slotState) {
      case GameStateMachineStates.BeginFreeSpinsPopup:
        this.FreeSpin();
        break;
      default:
        break;
    }
  }
}
