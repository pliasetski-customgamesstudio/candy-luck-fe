import { SceneObject } from '@cgs/syd';

export interface IIconDrawOrderCalculator {
  getIconDrawOrder(
    iconNode: SceneObject,
    drawId: number,
    reelIndex: number,
    lineIndex: number
  ): number;
  getTopIconDrawOrder(
    iconNode: SceneObject,
    drawId: number,
    reelIndex: number,
    lineIndex: number
  ): number;
}
