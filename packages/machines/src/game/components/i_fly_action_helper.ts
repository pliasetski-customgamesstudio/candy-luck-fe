import { SceneObject, Vector2, Action, Tuple } from '@cgs/syd';

export interface IFlyActionHelper {
  flyAnimation(
    flyingNode: SceneObject,
    startPos: Vector2,
    endPos: Vector2,
    duration: number
  ): Action;

  loadSceneToSlot(sceneName: string, loadFromAdditional: boolean): SceneObject;

  collectSceneOnIconToHud(
    pos: number,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
      duration?: number;
      valueString?: string | null;
    }
  ): Tuple<Action, Action>;

  collectFromIconToMachineHolder(
    pos: number,
    destinationScenePos: Vector2,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
      valueString?: string | null;
      duration?: number;
    }
  ): Tuple<Action, Action>;

  collectFromIconToMachineHolderWithStartOffset(
    pos: number,
    destinationScenePos: Vector2,
    startOffset: Vector2,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
      valueString?: string | null;
    }
  ): Tuple<Action, Action>;

  getStartMovingScenePosition(positionOnReels: number, offset: Vector2): Vector2;

  getDestinationMovingScenePosition(destinationHolder: SceneObject): Vector2;

  getIconCenterPossitionOffset(): Vector2;

  addCreatedSceneToSlot(scene: SceneObject, initialPos: Vector2, parent: SceneObject): void;
  removeCreatedSceneFromSlot(scene: SceneObject): void;

  addCreatedSceneToSlotAction(
    scene: SceneObject,
    initialPos: Vector2,
    parent: SceneObject | null
  ): Action;
  removeCreatedSceneFromSlotAction(scene: SceneObject): Action;
}
