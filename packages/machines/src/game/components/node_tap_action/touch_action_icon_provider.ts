import { T_IGameParams, T_ResourcesComponent } from '../../../type_definitions';
import { IGameParams } from '../../../reels_engine/interfaces/i_game_params';
import { ResourcesComponent } from '../resources_component';
import { ActionNodeMouseState, BaseSlotActionNode } from './action_nodes/base_slot_action_node';
import { Container, Rect, Vector2 } from '@cgs/syd';
import { IActionNodeStrategy } from './strategies/i_action_node_strategy';
import { IconActionContext } from './contexts/icon_action_context';

export class TouchActionIconProvider {
  constructor(
    container: Container,
    actions: Map<ActionNodeMouseState, Array<IActionNodeStrategy<IconActionContext>>>,
    {
      uniqueList = null,
      ignoreList = null,
    }: { uniqueList: Array<number> | null; ignoreList: Array<number> | null }
  ) {
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const gameParams = container.forceResolve<IGameParams>(T_IGameParams);
    let iconsHolder = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .slot.findById('anim_icons_holder');

    if (!iconsHolder) {
      iconsHolder = container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .slot.findById('icons_holder');
    }

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end')!;

    const symbolSize = new Vector2(
      (iconFrameEnd.position.x - iconFrameStart.position.x) / (gameParams.groupsCount - 1),
      (iconFrameEnd.position.y - iconFrameStart.position.y) / (gameParams.maxIconsPerGroup - 1)
    );

    for (let i = 0; i < gameParams.groupsCount; i++) {
      const reelOffset = new Vector2(0.0, res.findStartReelNode(i).position.y);

      for (let j = 0; j < gameParams.maxIconsPerGroup; j++) {
        const clickNode = new BaseSlotActionNode(container, i, j, actions, uniqueList, ignoreList);
        clickNode.position = new Vector2(symbolSize.x * i, symbolSize.y * j).add(reelOffset);
        clickNode.touchable = true;
        clickNode.touchArea = Rect.fromSize(Vector2.Zero, new Vector2(symbolSize.x, symbolSize.y));
        iconsHolder!.addChild(clickNode);
      }
    }

    iconsHolder!.touchable = true;
    iconsHolder!.initialize();
  }
}
