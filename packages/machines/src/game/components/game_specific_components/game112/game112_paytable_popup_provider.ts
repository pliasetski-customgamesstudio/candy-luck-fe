import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { PaytableView } from '../../../common/slot/views/paytable_view';
import { PaytablePopupComponent } from '../../popups/paytable_popup_component';
import { Game112PayTablePopupController } from './game112_paytable_popup_controller';

export class Game112PayTablePopupProvider extends PaytablePopupComponent {
  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false
  ) {
    super(container, sceneCommon, stopBackgroundSound);
  }

  init(container: Container, stopBackgroundSound: boolean): void {
    this.view = new PaytableView(container, this.rootScene, this.popupScene);
    this.popupController = new Game112PayTablePopupController(
      container,
      this.view,
      stopBackgroundSound
    );
  }
}
