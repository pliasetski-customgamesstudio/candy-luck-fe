import { Container } from '@cgs/syd';
import { ExtendedStartFreeSpinsPopupView } from './extended_free_spins_popup_view';
import { BasePopupComponent } from '../../popups/base_popup_component';
import { ExtendedStartFreeSpinsController } from './extended_free_spins_controller';
import { SceneCommon } from '@cgs/common';

export class ExtendedStartFreeSpinsPopupProvider extends BasePopupComponent<ExtendedStartFreeSpinsPopupView> {
  private _view: ExtendedStartFreeSpinsPopupView;
  private _controller: ExtendedStartFreeSpinsController;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    startWithButton: boolean = false,
    stopBackgroundSoundOnStart: boolean = false,
    stopBackgroundSoundOnAdd: boolean = false,
    useFreeSpinMode: boolean = false,
    useViewUpdater: boolean = false,
    defaultPopupOnGroupSwitch: boolean = true
  ) {
    super(container, sceneCommon, 'slot/popups/start_freespins/scene_mobile');
    this._view = new ExtendedStartFreeSpinsPopupView(
      this.rootScene,
      this.popupScene,
      startWithButton,
      container,
      useFreeSpinMode
    );
    const extendedStartFreeSpinsController = new ExtendedStartFreeSpinsController(
      this._view,
      container,
      stopBackgroundSoundOnStart,
      stopBackgroundSoundOnAdd,
      useFreeSpinMode,
      useViewUpdater,
      defaultPopupOnGroupSwitch
    );
    this.popupController = extendedStartFreeSpinsController;
    this._controller = extendedStartFreeSpinsController;
  }

  get view(): ExtendedStartFreeSpinsPopupView {
    return this._view;
  }

  get controller(): ExtendedStartFreeSpinsController {
    return this._controller;
  }
}
