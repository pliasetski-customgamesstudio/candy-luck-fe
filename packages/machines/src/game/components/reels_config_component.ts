import { Container, SceneObject, Vector2 } from '@cgs/syd';
import { ReelsConfig } from '../../default_game/game_components/reels_config';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';
import { SlotParams } from '../../reels_engine/slot_params';
import { T_ResourcesComponent, T_IGameParams } from '../../type_definitions';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { ResourcesComponent } from './resources_component';

export class ReelsConfigComponent implements IReelsConfigProvider {
  reelsConfig: ReelsConfig;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const slotParams: SlotParams = container.forceResolve<IGameParams>(T_IGameParams) as SlotParams;
    const maxIconLength: number =
      slotParams.longIcons.length > 0
        ? slotParams.longIcons
            .map((e) => e.length)
            .reduce(
              (prevValue: number, currValue: number) =>
                currValue > prevValue ? currValue : prevValue,
              0
            )
        : 1;

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end') as SceneObject;
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

    this.reelsConfig = new ReelsConfig(
      slotSize,
      symbolSize,
      slotParams.reelsCount,
      slotParams.linesCount,
      reelsOffset,
      new Vector2(0.0, symbolSize.y * -maxIconLength)
    );
  }
}
