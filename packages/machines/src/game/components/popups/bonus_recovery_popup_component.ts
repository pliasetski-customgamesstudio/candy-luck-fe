import { Container } from '@cgs/syd';
import { BasePopupComponent } from './base_popup_component';
import { BonusRecoveryPopupView } from '../../common/slot/views/bonus_recovery_popup_view';
import { BonusRecoveryPopupController } from '../../common/slot/controllers/bonus_recovery_popup_controller';
import { SceneCommon } from '@cgs/common';

export class BonusRecoveryPopupComponent extends BasePopupComponent<BonusRecoveryPopupView> {
  constructor(container: Container, sceneCommon: SceneCommon) {
    super(container, sceneCommon, 'lobby/popups/sceneBonusRecovery');
    console.log('load ' + this.constructor.name);

    this._init(container);
  }

  private async _init(container: Container): Promise<void> {
    const view = new BonusRecoveryPopupView(this.rootScene, this.popupScene);
    this.popupController = new BonusRecoveryPopupController(container, view);
  }
}
