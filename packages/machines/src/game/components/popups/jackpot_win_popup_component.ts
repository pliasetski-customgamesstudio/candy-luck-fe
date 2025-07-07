import { Container } from '@cgs/syd';
import { JackPotPopupView } from '../../common/slot/views/jackpot_popup_view';
import { BasePopupComponent } from './base_popup_component';
import { SceneCommon } from '@cgs/common';
import { JackPotWinPopupController } from '../../common/slot/controllers/jackpot_popup_controller';

export class JackPotWinPopupComponent extends BasePopupComponent<JackPotPopupView> {
  private _view: JackPotPopupView;
  public get view(): JackPotPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string = 'slot/popups/scatter/scene',
    stopBackgroundSound: boolean = false,
    useTextAnimation: boolean = false,
    textAnimDuration: number = 0.0,
    incrementDuration: number = 0.0,
    winPositionsSymbolId: number | null = null,
    soundName: string | null = null,
    closeWithButton: boolean = false,
    updateJackpotAtClose: boolean = true
  ) {
    super(container, sceneCommon, sceneName);
    console.log('load ' + this.constructor.name);
    this._view = new JackPotPopupView(
      container,
      this.rootScene,
      this.popupScene,
      textAnimDuration,
      incrementDuration,
      closeWithButton
    );
    this.popupController = new JackPotWinPopupController(
      container,
      this.view,
      stopBackgroundSound,
      useTextAnimation,
      winPositionsSymbolId,
      soundName,
      updateJackpotAtClose
    );
  }
}
