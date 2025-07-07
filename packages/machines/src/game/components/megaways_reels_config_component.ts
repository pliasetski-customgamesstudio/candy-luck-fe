import { T_IGameParams, T_ResourcesComponent } from '../../type_definitions';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { ReelsConfig } from '../../default_game/game_components/reels_config';
import { Container, Vector2 } from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { SlotParams } from '../../reels_engine/slot_params';

export class MegawaysReelsConfigComponent implements IReelsConfigProvider {
  reelsConfig: ReelsConfig;
  private _container: Container;

  constructor(container: Container) {
    this._container = container;
    console.log('load ' + this.constructor.name);
    const res: ResourcesComponent =
      this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const slotParams: SlotParams = this._container.forceResolve<SlotParams>(
      T_IGameParams
    ) as SlotParams;
    const maxIconLength =
      slotParams.longIcons && slotParams.longIcons.length > 0
        ? slotParams.longIcons
            .map((e) => e.length)
            .reduce((prevValue: number, currValue: number) =>
              currValue > prevValue ? currValue : prevValue
            )
        : 1;

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end')!;
    const symbolSize: Vector2 = new Vector2(iconFrameStart.size.x, iconFrameStart.size.y);
    const symbolSizeByReel: Vector2[] = [];
    for (let r = 0; r < slotParams.reelsCount; r++) {
      const startNode = res.findStartReelNode(r);
      if (startNode) {
        symbolSizeByReel.push(new Vector2(startNode.size.x, startNode.size.y));
      } else {
        symbolSizeByReel.push(new Vector2(iconFrameStart.size.x, iconFrameStart.size.y));
      }
    }
    const reelsOffset: Vector2[] = new Array<Vector2>(slotParams.reelsCount).fill(Vector2.Zero);
    for (let i = 0; i < slotParams.reelsCount; i++) {
      reelsOffset[i] = new Vector2(
        res.findStartReelNode(i).position.x - i * symbolSizeByReel[i].x,
        res.findStartReelNode(i).position.y
      );
    }
    const slotSize: Vector2 = iconFrameEnd.position
      .subtract(iconFrameStart.position)
      .add(symbolSize);
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

  updateConfig(linesInReel: number[]): void {
    const res: ResourcesComponent =
      this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const slotParams: SlotParams = this._container.forceResolve<SlotParams>(T_IGameParams);
    const maxIconLength =
      slotParams.longIcons && slotParams.longIcons.length > 0
        ? slotParams.longIcons
            .map((e) => e.length)
            .reduce((prevValue: number, currValue: number) =>
              currValue > prevValue ? currValue : prevValue
            )
        : 1;

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end')!;
    const symbolSize: Vector2 = new Vector2(iconFrameStart.size.x, iconFrameStart.size.y);
    const symbolSizeByReel: Vector2[] = [];
    for (let r = 0; r < slotParams.reelsCount; r++) {
      if (linesInReel[r] == 0) linesInReel[r] = slotParams.linesCount;
      const startNode = res.findStartReelNode(r);
      if (startNode) {
        symbolSizeByReel.push(
          new Vector2(startNode.size.x, (startNode.size.y * slotParams.linesCount) / linesInReel[r])
        );
      } else {
        symbolSizeByReel.push(
          new Vector2(
            iconFrameStart.size.x,
            (iconFrameStart.size.y * slotParams.linesCount) / linesInReel[r]
          )
        );
      }
    }
    const reelsOffset: Vector2[] = new Array<Vector2>(slotParams.reelsCount).fill(Vector2.Zero);
    for (let i = 0; i < slotParams.reelsCount; i++) {
      reelsOffset[i] = new Vector2(
        res.findStartReelNode(i).position.x - i * symbolSizeByReel[i].x,
        res.findStartReelNode(i).position.y
      );
    }
    const slotSize: Vector2 = iconFrameEnd.position
      .subtract(iconFrameStart.position)
      .add(symbolSize);
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
