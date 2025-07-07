import { Container } from 'inversify';
import { IReelsConfigProvider, IReelsConfig } from 'machines';
import { ResourcesComponent, Vector2 } from 'syd';
import { SlotParams, ISlotGameModule } from 'machines/src/reels_engine_library';

class ModuleReelsConfigProvider implements IReelsConfigProvider {
  reelsConfig: IReelsConfig;

  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const moduleParams: SlotParams = container.resolve(ISlotGameModule).moduleParams as SlotParams;
    const maxIconLength: number =
      moduleParams.longIcons.length > 0
        ? moduleParams.longIcons
            .map((e: string[]) => e.length)
            .reduce((prevValue: number, currValue: number) =>
              currValue > prevValue ? currValue : prevValue
            )
        : 1;

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end');
    const symbolSize: Vector2 = new Vector2(
      (iconFrameEnd.position.x - iconFrameStart.position.x) / (moduleParams.reelsCount - 1),
      (iconFrameEnd.position.y - iconFrameStart.position.y) / (moduleParams.linesCount - 1)
    );
    const slotSize: Vector2 = new Vector2(
      symbolSize.x * moduleParams.reelsCount,
      symbolSize.y * moduleParams.linesCount
    );

    const reelsOffset: Vector2[] = new Array<Vector2>(moduleParams.reelsCount).fill(Vector2.Zero);
    for (let i = 0; i < moduleParams.reelsCount; i++) {
      reelsOffset[i] = new Vector2(0.0, res.findStartReelNode(i).position.y);
    }

    this.reelsConfig = new ReelsConfig(
      slotSize,
      symbolSize,
      moduleParams.reelsCount,
      moduleParams.linesCount,
      reelsOffset,
      new Vector2(0.0, symbolSize.y * -maxIconLength)
    );
  }
}
