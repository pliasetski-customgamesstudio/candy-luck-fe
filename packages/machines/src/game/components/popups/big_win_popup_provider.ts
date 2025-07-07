import { Container } from '@cgs/syd';
import { BasePopupComponent } from './base_popup_component';
import { BigWinPopupView } from '../../common/slot/views/big_win_popup_view';
import { BigWinPopupController } from '../../common/slot/controllers/big_win_popup_controller';
import { SceneCommon } from '@cgs/common';

export class BigWinPopupProvider extends BasePopupComponent<BigWinPopupView> {
  constructor(container: Container, sceneCommon: SceneCommon, stopBackgroundSound: boolean = true) {
    super(container, sceneCommon, 'big_win/scene');
    console.log('load ' + this.constructor.name);
    const view = new BigWinPopupView(this.rootScene, this.popupScene);
    this.popupController = new BigWinPopupController(container, view, stopBackgroundSound);
  }
}
