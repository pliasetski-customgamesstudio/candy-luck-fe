import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { NotEnoughBalanceController } from './not_enough_balance_controller';
import { NotEnoughBalanceView } from './not_enough_balance_view';
import { BasePopupComponent } from './popups/base_popup_component';

export class NotEnoughBalanceProvider extends BasePopupComponent<NotEnoughBalanceView> {
  private _view: NotEnoughBalanceView;
  public get view(): NotEnoughBalanceView {
    return this._view;
  }

  private _container: Container;
  public get container(): Container {
    return this._container;
  }

  constructor(container: Container, sceneCommon: SceneCommon) {
    super(container, sceneCommon, 'bottom/notEnoughBalancePopup');
    this._view = new NotEnoughBalanceView(this.rootScene, this.popupScene, container);
    this.popupController = new NotEnoughBalanceController(container, this._view);
  }
}
