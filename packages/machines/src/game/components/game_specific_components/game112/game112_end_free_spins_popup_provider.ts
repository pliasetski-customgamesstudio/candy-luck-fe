import { SceneCommon } from '@cgs/common';
import { SceneObject, Container } from '@cgs/syd';
import { BasePopupComponent } from '../../popups/base_popup_component';
import { Game112EndFreeSpinsPopupController } from './game112_end_free_spins_popup_controller';
import { Game112EndFreeSpinsPopupView } from './game112_end_free_spins_popup_view';

export class Game112EndFreeSpinsPopupComponent extends BasePopupComponent<Game112EndFreeSpinsPopupView> {
  private _view: Game112EndFreeSpinsPopupView;
  get holder(): SceneObject {
    return this.popupScene;
  }
  get view(): Game112EndFreeSpinsPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false,
    useFreespinMode: boolean = false,
    closeOnAnimFinished: boolean = false
  ) {
    super(container, sceneCommon, 'slot/popups/end_freespins/scene');
    console.log('load ' + this.constructor.name);
    this._view = new Game112EndFreeSpinsPopupView(
      this.rootScene,
      this.popupScene,
      closeOnAnimFinished,
      container,
      sceneCommon
    );
    this.popupController = new Game112EndFreeSpinsPopupController(
      container,
      this._view,
      stopBackgroundSound,
      useFreespinMode
    );
  }
}
