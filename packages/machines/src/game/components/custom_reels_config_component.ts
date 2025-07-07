import { Container, Vector2 } from '@cgs/syd';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { ReelsConfig } from '../../default_game/game_components/reels_config';
import { SlotParams } from '../../reels_engine/slot_params';
import { T_ResourcesComponent, T_IGameParams } from '../../type_definitions';
import { ResourcesComponent } from './resources_component';

export class CustomReelsConfigComponent implements IReelsConfigProvider {
  reelsConfig: ReelsConfig;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const res = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const slotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    const maxIconLength =
      slotParams.longIcons && slotParams.longIcons.length > 0
        ? slotParams.longIcons
            .map((e) => e.length)
            .reduce((prevValue, currValue) => (currValue > prevValue ? currValue : prevValue), 0)
        : 1;

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end')!;
    const symbolSize = new Vector2(iconFrameStart.size.x, iconFrameStart.size.y);
    const symbolSizeByReel: Vector2[] = [];
    for (let r = 0; r < slotParams.reelsCount; r++) {
      const startNode = res.findStartReelNode(r);
      if (startNode) {
        symbolSizeByReel.push(new Vector2(startNode.size.x, startNode.size.y));
      } else {
        symbolSizeByReel.push(new Vector2(iconFrameStart.size.x, iconFrameStart.size.y));
      }
    }
    const reelsOffset: Vector2[] = Array(slotParams.reelsCount).fill(Vector2.Zero);
    for (let i = 0; i < slotParams.reelsCount; i++) {
      reelsOffset[i] = new Vector2(
        res.findStartReelNode(i).position.x - i * symbolSizeByReel[i].x,
        res.findStartReelNode(i).position.y
      );
    }
    const slotSize = iconFrameEnd.position.subtract(iconFrameStart.position).add(symbolSize);
    const slotSizeByReel: Vector2[] = [];
    for (let r = 0; r < slotParams.reelsCount; r++) {
      slotSizeByReel.push(new Vector2(slotSize.x, symbolSizeByReel[r].y * slotParams.linesCount));
    }
    const offsetByReel: Vector2[] = [];
    for (let r = 0; r < slotParams.reelsCount; r++) {
      offsetByReel.push(new Vector2(0.0, symbolSizeByReel[r].y * -maxIconLength));
    }

    this.reelsConfig = new ReelsConfig(
      slotSize,
      symbolSize,
      slotParams.reelsCount,
      slotParams.linesCount,
      reelsOffset,
      new Vector2(0.0, symbolSize.y * -maxIconLength),
      slotSizeByReel,
      symbolSizeByReel,
      offsetByReel
    );
  }
}
