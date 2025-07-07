import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { BasePopupComponent } from '../../popups/base_popup_component';
import { Game112StartFreeSpinsPopupController } from './game112_start_free_spins_popup_controller';
import { Game112StartFreeSpinsPopupView } from './game112_start_free_spins_popup_view';

export class Game112StartFreeSpinsPopupProvider extends BasePopupComponent<Game112StartFreeSpinsPopupView> {
  private _view: Game112StartFreeSpinsPopupView;
  public get view(): Game112StartFreeSpinsPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    startByButton: boolean = false,
    stopBackgroundSoundOnStart: boolean = false,
    stopBackgroundSoundOnAdd: boolean = false,
    useFreeSpinMode: boolean = false
  ) {
    super(container, sceneCommon, 'slot/popups/start_freespins/scene');
    console.log('load ' + this.constructor.name);
    this._view = new Game112StartFreeSpinsPopupView(
      this.rootScene,
      this.popupScene,
      startByButton,
      container,
      useFreeSpinMode
    );
    this.popupController = new Game112StartFreeSpinsPopupController(
      container,
      this.notifier,
      this.slotSession,
      this.view,
      stopBackgroundSoundOnStart,
      stopBackgroundSoundOnAdd,
      useFreeSpinMode
    );
  }
}
