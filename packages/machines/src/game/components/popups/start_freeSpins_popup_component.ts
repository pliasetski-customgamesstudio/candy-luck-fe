import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { StartFreeSpinsPopupController } from '../../common/slot/controllers/start_freespins_popup_controller';
import { StartFreeSpinsPopupView } from '../../common/slot/views/start_freespins_popup_view';
import { BasePopupComponent } from './base_popup_component';

export class StartFreeSpinsPopupComponent extends BasePopupComponent<StartFreeSpinsPopupView> {
  private _view: StartFreeSpinsPopupView;
  public get view(): StartFreeSpinsPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      startByButton = false,
      stopBackgroundSoundOnStart = false,
      stopBackgroundSoundOnAdd = false,
      useFreeSpinMode = false,
      useViewUpdater = false,
    } = {
      startByButton: false,
      stopBackgroundSoundOnStart: false,
      stopBackgroundSoundOnAdd: false,
      useFreeSpinMode: false,
      useViewUpdater: false,
    }
  ) {
    super(container, sceneCommon, 'slot/popups/start_freespins/scene');
    console.log('load ' + this.constructor.name);
    this._view = new StartFreeSpinsPopupView(
      this.rootScene,
      this.popupScene,
      startByButton,
      container,
      useFreeSpinMode
    );
    this.popupController = new StartFreeSpinsPopupController(
      container,
      this.notifier,
      this.slotSession,
      this.view,
      stopBackgroundSoundOnStart,
      stopBackgroundSoundOnAdd,
      useFreeSpinMode,
      useViewUpdater
    );
  }
}
