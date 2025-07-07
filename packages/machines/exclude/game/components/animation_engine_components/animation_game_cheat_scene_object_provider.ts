import { Container } from 'machines';
import { ResourcesComponent, SceneObject, Vector2, Rect } from 'syd';
import { IGameParams } from 'machines/src/reels_engine_library';

class AnimationGameCheatSceneObjectProvider {
  constructor(container: Container) {
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const iconsHolder: SceneObject = res.slot.findById('icons_holder');

    const gameParams: IGameParams = container.forceResolve<IGameParams>(T_IGameParams);

    const iconFrameStart = res.findStartReelNode(0);
    const iconFrameEnd = res.slot.findById('slot_end');
    const symbolSize: Vector2 = new Vector2(
      (iconFrameEnd.position.x - iconFrameStart.position.x) / (gameParams.groupsCount - 1),
      (iconFrameEnd.position.y - iconFrameStart.position.y) / (gameParams.maxIconsPerGroup - 1)
    );

    const reelsOffset: Vector2[] = new Array<Vector2>(gameParams.groupsCount).fill(Vector2.Zero);
    for (let i = 0; i < gameParams.groupsCount; i++) {
      reelsOffset[i] = new Vector2(0.0, res.findStartReelNode(i).position.y);
    }

    for (let i = 0; i < gameParams.groupsCount; i++) {
      const reelOffset = reelsOffset[i];
      const cheatSceneObject = new CheatSceneObject(container, i);
      cheatSceneObject.position = new Vector2(symbolSize.x * i, 0.0).add(reelOffset);
      cheatSceneObject.touchable = true;
      cheatSceneObject.touchArea = new Rect(
        Vector2.Zero,
        new Vector2(symbolSize.x, symbolSize.y * gameParams.maxIconsPerGroup)
      );
      iconsHolder.touchable = true;
      iconsHolder.initialize();
      iconsHolder.addChild(cheatSceneObject);
    }
  }
}
