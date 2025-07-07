import { SceneObject, Container } from '@cgs/syd';
import { GameStateMachineStates } from '../../reels_engine/state_machine/game_state_machine';
import { T_ResourcesComponent, T_GameStateMachineNotifierComponent } from '../../type_definitions';
import {
  AbstractListener,
  GameStateMachineNotifier,
  GameStateMachineNotifierComponent,
} from './game_state_machine_notifier_component';
import { ResourcesComponent } from './resources_component';

export class HideElementsComponent implements AbstractListener {
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
    console.log('load ' + this.constructor.name);
    this._container = container;
    if (elements) {
      for (const element of elements) {
        this._elements.push(element);
      }
    }

    const notifier: GameStateMachineNotifier =
      this._container.forceResolve<GameStateMachineNotifierComponent>(
        T_GameStateMachineNotifierComponent
      ).notifier;
    notifier.AddListener(this);
  }

  RegularSpin(): void {
    for (const element of this._elements) {
      const so: SceneObject = this.Root.findById(element)!;
      so.stateMachine!.switchToState('default');
    }
  }

  Hide(): void {
    for (const element of this._elements) {
      const so: SceneObject = this.Root.findById(element)!;
      so.stateMachine!.switchToState('hide');
    }
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
      case GameStateMachineStates.Scatter:
        this.Hide();
        break;
    }
  }

  OnStateExited(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.Bonus:
      case GameStateMachineStates.Scatter:
        this.RegularSpin();
        break;
    }
  }
}
