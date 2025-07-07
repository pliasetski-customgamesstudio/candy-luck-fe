import { SceneObject } from '@cgs/syd';
import { IViewFactory } from '../../../common/src';
import { DrawOrderConstants } from '../game/common/slot/views/base_popup_view';

export class GameViewHelper {
  static addViewToContentHolder(
    viewType: any,
    viewFactory: IViewFactory,
    parent: SceneObject,
    holderName: string = 'hudMovingNode'
  ): void {
    const contentHolder = parent.findById(holderName);
    if (contentHolder) {
      const tooltips = viewFactory.createView(viewType);
      tooltips.z = DrawOrderConstants.SlotHudViewDrawOrder - 1;
      tooltips.initialize();
      contentHolder.addChild(tooltips);
    }
  }
}
