import { ExtendedEndFreeSpinsPopupView } from './extended_end_free_spins_popup_view';
import { BasePopupComponent } from '../../popups/base_popup_component';
import { Container, SceneObject } from '@cgs/syd';
import { SceneCommon } from '@cgs/common';
import { ExtendedEndFreeSpinsPopupController } from './extended_end_free_spins_popup_controller';

export class ExtendedEndFreeSpinsPopupProvider extends BasePopupComponent<ExtendedEndFreeSpinsPopupView> {
  private _view: ExtendedEndFreeSpinsPopupView;
  get holder(): SceneObject {
    return this.popupScene;
  }
  get view(): ExtendedEndFreeSpinsPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean = false,
    useFreespinMode: boolean = false,
    useViewUpdater: boolean = false,
    closeOnAnimFinished: boolean = false,
    respinsName?: string[],
    baseGameFS?: string[]
  ) {
    super(container, sceneCommon, 'slot/popups/end_freespins/scene_mobile');
    console.log('load ' + this.constructor.name);
    this.createOverridedComponents(
      container,
      sceneCommon,
      stopBackgroundSound,
      useFreespinMode,
      useViewUpdater,
      closeOnAnimFinished,
      respinsName ?? null,
      baseGameFS ?? null
    );
  }

  private createOverridedComponents(
    container: Container,
    sceneCommon: SceneCommon,
    stopBackgroundSound: boolean,
    useFreespinMode: boolean,
    useViewUpdater: boolean,
    closeOnAnimFinished: boolean,
    respinsName: string[] | null,
    baseGameFS: string[] | null
  ) {
    this._view = new ExtendedEndFreeSpinsPopupView(
      this.rootScene,
      this.popupScene,
      closeOnAnimFinished
    );
    this.popupController = new ExtendedEndFreeSpinsPopupController(
      container,
      this._view,
      stopBackgroundSound,
      useFreespinMode,
      useViewUpdater,
      respinsName,
      baseGameFS
    );
  }
}
