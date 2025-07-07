import { SceneObject } from '@cgs/syd';
import { IIconDrawOrderCalculator } from './game_components_providers/i_icon_draw_order_calculator';

export class IconDrawOrderCalculator implements IIconDrawOrderCalculator {
  getIconDrawOrder(
    iconNode: SceneObject,
    drawId: number,
    reelIndex: number,
    lineIndex: number
  ): number {
    const originalDrawOrder = iconNode ? iconNode.z : 0;
    return originalDrawOrder + lineIndex + reelIndex;
  }

  getTopIconDrawOrder(
    iconNode: SceneObject,
    drawId: number,
    reelIndex: number,
    lineIndex: number
  ): number {
    const originalDrawOrder = iconNode ? iconNode.z : 0;
    return originalDrawOrder + lineIndex + reelIndex + 100000;
  }
}
