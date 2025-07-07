import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { SelectiveJackpotPopupView } from '../../../common/slot/views/selective_jackpot_popup_view';
import { BasePopupComponent } from '../../popups/base_popup_component';
import { Game112SelectiveJackpotPopupController } from './game112_selective_jackpot_popup_controller';
import { JackPotPopupView } from '../../../common/slot/views/jackpot_popup_view';

export class Game112SelectiveJackpotPopupProvider extends BasePopupComponent<JackPotPopupView> {
  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      sceneName = 'slot/popups/scatter/scene',
      stopBackgroundSound = false,
      useTextAnimation = false,
      textAnimDuration = 0.0,
      incrementDuration = 0.0,
      winPositionsSymbolId = null,
      soundName = null,
      closeWithButton = false,
      updateJackpotAtClose = true,
      countOfFlashCashRequired = -1,
    }: {
      sceneName?: string;
      stopBackgroundSound?: boolean;
      useTextAnimation?: boolean;
      textAnimDuration?: number;
      incrementDuration?: number;
      winPositionsSymbolId?: number | null;
      soundName?: string | null;
      closeWithButton?: boolean;
      updateJackpotAtClose?: boolean;
      countOfFlashCashRequired?: number;
    } = {
      stopBackgroundSound: false,
      useTextAnimation: false,
      textAnimDuration: 0.0,
      incrementDuration: 0.0,
      winPositionsSymbolId: null,
      soundName: null,
      closeWithButton: false,
      updateJackpotAtClose: true,
      countOfFlashCashRequired: -1,
    }
  ) {
    super(container, sceneCommon, sceneName);
    console.log('load ' + this.constructor.name);
    const view = new SelectiveJackpotPopupView(
      container,
      this.rootScene,
      this.popupScene,
      textAnimDuration,
      incrementDuration,
      closeWithButton
    );
    this.popupController = new Game112SelectiveJackpotPopupController(
      container,
      view,
      stopBackgroundSound,
      useTextAnimation,
      winPositionsSymbolId,
      soundName,
      updateJackpotAtClose,
      countOfFlashCashRequired
    );
  }
}
