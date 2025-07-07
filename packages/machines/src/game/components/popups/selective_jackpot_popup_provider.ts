import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { SelectiveJackpotPopupController } from '../../common/slot/controllers/selective_jackpot_popup_controller';
import { SelectiveJackpotPopupView } from '../../common/slot/views/selective_jackpot_popup_view';
import { BasePopupComponent } from './base_popup_component';
import { JackPotPopupView } from '../../common/slot/views/jackpot_popup_view';

export class SelectiveJackpotPopupProvider extends BasePopupComponent<JackPotPopupView> {
  private _view: SelectiveJackpotPopupView;
  public get view(): SelectiveJackpotPopupView {
    return this._view;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      sceneName = 'slot/popups/scatter/scene',
      stopBackgroundSound = false,
      useTextAnimation = false,
      textAnimDuration = 0.0,
      incrementDuration = 0.0,
      winPositionsSymbolId,
      soundName,
      closeWithButton = false,
      updateJackpotAtClose = true,
      winPositionsToRemove,
      shortWinLineGroups,
    }: {
      sceneName: string;
      stopBackgroundSound: boolean;
      useTextAnimation: boolean;
      textAnimDuration: number;
      incrementDuration: number;
      winPositionsSymbolId: number;
      soundName: string;
      closeWithButton: boolean;
      updateJackpotAtClose: boolean;
      winPositionsToRemove: string[];
      shortWinLineGroups: string[];
    }
  ) {
    super(container, sceneCommon, sceneName);
    console.log('load ' + this.constructor.name);
    this._view = new SelectiveJackpotPopupView(
      container,
      this.rootScene,
      this.popupScene,
      textAnimDuration,
      incrementDuration,
      closeWithButton
    );
    this.popupController = new SelectiveJackpotPopupController(
      container,
      this.view,
      stopBackgroundSound,
      useTextAnimation,
      winPositionsSymbolId,
      soundName,
      updateJackpotAtClose,
      winPositionsToRemove,
      shortWinLineGroups
    );
  }
}
