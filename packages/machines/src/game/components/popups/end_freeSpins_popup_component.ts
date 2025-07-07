import { SceneCommon } from '@cgs/common';
import { SceneObject, Container } from '@cgs/syd';
import { EndFreeSpinsPopupController } from '../../common/slot/controllers/end_freespins_popup_controller';
import { EndFreeSpinsPopupView } from '../../common/slot/views/end_freespins_popup_view';
import { BasePopupComponent } from './base_popup_component';

export class EndFreeSpinsPopupComponent extends BasePopupComponent<EndFreeSpinsPopupView> {
  private _view: EndFreeSpinsPopupView;
  get holder(): SceneObject {
    return this.popupScene;
  }
  get view(): EndFreeSpinsPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false,
    useFreespinMode: boolean = false,
    closeOnAnimFinished: boolean = false,
    useViewUpdater: boolean = false
  ) {
    super(container, sceneCommon, 'slot/popups/end_freespins/scene');
    console.log('load ' + this.constructor.name);
    this.createComponents(
      container,
      sceneCommon,
      stopBackgroundSound,
      useFreespinMode,
      closeOnAnimFinished,
      useViewUpdater
    );
  }

  private createComponents(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false,
    useFreespinMode: boolean = false,
    closeOnAnimFinished: boolean = false,
    useViewUpdater: boolean = false
  ) {
    this._view = new EndFreeSpinsPopupView(this.rootScene, this.popupScene, closeOnAnimFinished);
    this.popupController = new EndFreeSpinsPopupController(
      container,
      this._view,
      stopBackgroundSound,
      useFreespinMode,
      useViewUpdater
    );
  }
}
