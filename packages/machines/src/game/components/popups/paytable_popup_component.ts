import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { PaytableController } from '../../common/slot/controllers/paytable_controller';
import { PaytableView } from '../../common/slot/views/paytable_view';
import { BasePopupComponent } from './base_popup_component';

export class PaytablePopupComponent extends BasePopupComponent<PaytableView> {
  view: PaytableView;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false,
    sceneName: string = 'slot/paytable/scene'
  ) {
    super(container, sceneCommon, sceneName);
    console.log('load ' + this.constructor.name);

    this.init(container, stopBackgroundSound);
  }

  protected init(container: Container, stopBackgroundSound: boolean): void {
    this.view = new PaytableView(container, this.rootScene, this.popupScene);
    this.popupController = new PaytableController(container, this.view, stopBackgroundSound);
  }
}
