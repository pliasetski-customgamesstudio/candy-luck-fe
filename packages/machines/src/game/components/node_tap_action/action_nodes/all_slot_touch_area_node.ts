import { ActionNodeMouseState, BaseSlotActionNode } from './base_slot_action_node';
import { BreakerContext } from '../contexts/breaker_context';
import { Container } from '@cgs/syd';
import { IActionNodeStrategy } from '../strategies/i_action_node_strategy';

export class AllSlotTouchAreaNode extends BaseSlotActionNode<BreakerContext> {
  private readonly _breakeableProviders: any[];

  constructor(
    container: Container,
    actions: Map<ActionNodeMouseState, Array<IActionNodeStrategy<BreakerContext>>>,
    breakeableProviders: Array<any>,
    reelIndex: number = 0,
    lineIndex: number = 0
  ) {
    super(container, reelIndex, lineIndex, actions);
    this._breakeableProviders = breakeableProviders;
  }

  protected buildActionContext(): any {
    const context = new BreakerContext();
    context.breakeableProviders = this._breakeableProviders;
    return context;
  }
}
