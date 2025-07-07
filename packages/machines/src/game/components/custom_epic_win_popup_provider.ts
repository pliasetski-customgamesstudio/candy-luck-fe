import { SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { CustomEpicWinPopupController } from './custom_epic_win_popup_controller';
import { CustomEpicWinPopupView } from './custom_epic_win_popup_view';
import { EpicWinPopupProvider } from './epic_win/epic_win_popup_provider';

export class CustomEpicWinPopupProvider extends EpicWinPopupProvider {
  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string = 'big_win_new/scene_mobile',
    soundName: string = 'big_win_new/sound',
    startAfterShortWinLines: boolean = false,
    featureName: string[] | null = null,
    ignoreOnStartRespins: boolean = false
  ) {
    super(
      container,
      sceneCommon,
      sceneName,
      soundName,
      startAfterShortWinLines,
      featureName,
      ignoreOnStartRespins
    );
  }

  createController(): void {
    const view = new CustomEpicWinPopupView(
      this.container,
      this.rootScene,
      this.popupScene,
      this.popupSoundScene,
      this.newLobbyEpicWinConfiguration
    );
    this.popupController = new CustomEpicWinPopupController(
      this.container,
      view,
      this.newLobbyEpicWinConfiguration,
      true,
      this.startAfterShortWinLines,
      this.featureName,
      this.ignoreOnStartRespins
    );

    this.subscribeEvents();
  }
}
