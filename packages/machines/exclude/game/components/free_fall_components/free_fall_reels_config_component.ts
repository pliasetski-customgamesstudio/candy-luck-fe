import { Container } from 'inversify';
import { IReelsConfigProvider } from './IReelsConfigProvider';
import { IReelsConfig } from './IReelsConfig';
import { ResourcesComponent } from './ResourcesComponent';
import { IGameParams } from './IGameParams';
import { SlotParams } from './SlotParams';
import { Vector2 } from './Vector2';
import { FreeFallReelsConfig } from './FreeFallReelsConfig';

class FreeFallReelsConfigComponent implements IReelsConfigProvider {
  reelsConfig: IReelsConfig;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const slotParams: SlotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    const maxIconLength: number =
      slotParams.longIcons.length > 0
        ? slotParams.longIcons
            .map((e: string[]) => e.length)
            .reduce(
              (prevValue: number, currValue: number) =>
                currValue > prevValue ? currValue : prevValue,
              0
            )
        : 0;

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end');
    const symbolSize: Vector2 = new Vector2(
      (iconFrameEnd.position.x - iconFrameStart.position.x) / (slotParams.reelsCount - 1),
      (iconFrameEnd.position.y - iconFrameStart.position.y) / (slotParams.linesCount - 1)
    );
    const slotSize: Vector2 = new Vector2(
      symbolSize.x * slotParams.reelsCount,
      symbolSize.y * slotParams.linesCount
    );

    const reelsOffset: Vector2[] = new Array<Vector2>(slotParams.reelsCount).fill(Vector2.Zero);
    for (let i = 0; i < slotParams.reelsCount; i++) {
      reelsOffset[i] = new Vector2(0.0, res.findStartReelNode(i).position.y);
    }

    this.reelsConfig = new FreeFallReelsConfig(
      slotSize,
      symbolSize,
      slotParams.reelsCount,
      slotParams.linesCount,
      reelsOffset,
      new Vector2(0.0, symbolSize.y * -maxIconLength)
    );
  }
}
