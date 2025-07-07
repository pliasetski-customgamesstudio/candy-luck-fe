import {
  T_FreeSpinsLogoComponent,
  T_IGameStateMachineProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { Container, SceneObject } from '@cgs/syd';
import { SlotVisualizationComponent } from '../slot_visualization_component';
import { ResourcesComponent } from './resources_component';
import { FreeSpinsLogoComponent } from './freeSpins_logo_component';

export interface RelativeDrawOrderConfig {
  baseComponent: string;
  higherDrawOrderComponents: { [key: string]: number };
  lowerDrawOrderComponents: { [key: string]: number };
}

export class ConstantDrawOrdersProvider {
  private _container: Container;
  private _drawOrderConfigs: RelativeDrawOrderConfig[];
  private _componentNodes: Map<string, SceneObject> = new Map<string, SceneObject>();

  constructor(container: Container, drawOrderConfigs: RelativeDrawOrderConfig[]) {
    this._container = container;
    this._drawOrderConfigs = drawOrderConfigs;
    const gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    gameStateMachine.init.entering.listen((e) => this.applyDrawOrders());
  }

  private applyDrawOrders(): void {
    this._drawOrderConfigs.forEach((config) => {
      const baseNode = this.getComponentNode(config.baseComponent);
      if (baseNode) {
        if (config.higherDrawOrderComponents) {
          Object.entries(config.higherDrawOrderComponents).forEach(([component, delta]) => {
            const componentNode = this.getComponentNode(component);
            if (componentNode) {
              componentNode.z = baseNode.z + delta;
            }
          });
        }

        if (config.lowerDrawOrderComponents) {
          Object.entries(config.lowerDrawOrderComponents).forEach(([component, delta]) => {
            const componentNode = this.getComponentNode(component);
            if (componentNode) {
              componentNode.z = baseNode.z - delta;
            }
          });
        }
      }
    });
  }

  private getComponentNode(component: string): SceneObject {
    if (!this._componentNodes.hasOwnProperty(component)) {
      let componentNode: SceneObject | null = null;
      switch (component) {
        case SlotVisualizationComponent.Machine:
          componentNode =
            this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
          break;
        case SlotVisualizationComponent.Logo:
          componentNode =
            this._container.forceResolve<FreeSpinsLogoComponent>(T_FreeSpinsLogoComponent).controller
              .logoNode;
          break;
        case SlotVisualizationComponent.Hud:
          componentNode =
            this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).footer;
          break;
      }

      this._componentNodes.set(component, componentNode!);
    }

    return this._componentNodes.get(component)!;
  }
}
