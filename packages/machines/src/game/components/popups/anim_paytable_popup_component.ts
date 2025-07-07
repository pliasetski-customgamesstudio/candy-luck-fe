import { Container } from '@cgs/syd';
import { PaytablePopupComponent } from './paytable_popup_component';
import { SceneCommon } from '@cgs/common';
import { AnimPaytableView } from '../../common/slot/views/anim_paytable_view';
import { PaytableController } from '../../common/slot/controllers/paytable_controller';

export class AnimPaytablePopupComponent extends PaytablePopupComponent {
  private _useIconResourceProvider: boolean;
  private _clearEffects: boolean;
  private _resetPosition: boolean;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      stopBackgroundSound = false,
      useIconResourceProvider = true,
      clearEffects = false,
      resetPosition = false,
    }
  ) {
    super(container, sceneCommon, stopBackgroundSound, 'slot/paytable/scene');
    console.log('load ' + this.constructor.name);

    this._useIconResourceProvider = useIconResourceProvider;
    this._clearEffects = clearEffects;
    this._resetPosition = resetPosition;
  }

  init(container: Container, stopBackgroundSound: boolean): void {
    this.view = new AnimPaytableView(
      container,
      this.rootScene,
      this.popupScene,
      this._useIconResourceProvider,
      this._clearEffects,
      this._resetPosition
    );
    this.popupController = new PaytableController(container, this.view, stopBackgroundSound);
  }
}
