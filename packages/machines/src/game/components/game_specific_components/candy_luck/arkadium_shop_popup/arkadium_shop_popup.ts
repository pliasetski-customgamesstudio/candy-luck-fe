import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { BasePopupComponent } from '../../../popups/base_popup_component';
import { ArkadiumShopPopupView } from './arkadium_shop_popup_view';
import { ArkadiumShopPopupController } from './arkadium_shop_popup_controller';
import { ResourcesComponent } from '../../../resources_component';
import { T_ResourcesComponent } from '../../../../../type_definitions';

export class ArkadiumGemsShopPopup extends BasePopupComponent<ArkadiumShopPopupView> {
  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false
  ) {
    super(container, sceneCommon, 'slot/shop/screenNode.sceneShop1');

    const resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    const view = new ArkadiumShopPopupView(
      container,
      this.rootScene,
      this.popupScene,
      resourcesComponent,
      sceneCommon
    );
    this.popupController = new ArkadiumShopPopupController(container, view, stopBackgroundSound);
  }
}
