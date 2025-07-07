import { Container, Vector2, Rect } from '@cgs/syd';
import { AllSlotTouchAreaNode } from '../action_nodes/all_slot_touch_area_node';
import { BreakerContext } from '../contexts/breaker_context';
import { IActionNodeStrategy } from '../strategies/i_action_node_strategy';
import { ProgressiveBreakerStrategy } from '../strategies/progressive_breaker_strategy';
import { ActionNodeMouseState } from '../action_nodes/base_slot_action_node';
import { ResourcesComponent } from '../../resources_component';
import { T_ResourcesComponent } from '../../../../type_definitions';

export class ProgressiveBreakerProvider {
  private readonly _breakStategy: IActionNodeStrategy<BreakerContext>;
  private readonly _breakeableProviders: symbol[];

  constructor(container: Container, breakeableProviders: symbol[]) {
    this._breakeableProviders = breakeableProviders;  
    this._breakStategy = new ProgressiveBreakerStrategy(container);
    const actions = new Map<ActionNodeMouseState, Array<IActionNodeStrategy<BreakerContext>>>([
      [ActionNodeMouseState.Click, [this._breakStategy]],
    ]);

    const allSlotAreaNode = new AllSlotTouchAreaNode(container, actions, breakeableProviders);
    allSlotAreaNode.position = new Vector2(0.0, 0.0);
    allSlotAreaNode.touchable = true;
    allSlotAreaNode.touchArea = new Rect(
      new Vector2(-10000.0, -10000.0),
      new Vector2(10000.0, 10000.0)
    );
    allSlotAreaNode.initialize();

    const root = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    root.addChild(allSlotAreaNode);
  }

  public doBreak(): void {
    const context = new BreakerContext();
    context.breakeableProviders = this._breakeableProviders;
    this._breakStategy.performStrategy(context);
  }
}
