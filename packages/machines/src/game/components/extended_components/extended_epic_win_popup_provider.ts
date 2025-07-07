import { ExtendedEpicWinPopupView } from './extended_epic_win_popup_view';
import { EpicWinPopupProvider } from '../epic_win/epic_win_popup_provider';
import { Container } from '@cgs/syd';
import { SceneCommon } from '@cgs/common';
import { ExtendedEpicWinPopupController } from './extended_epic_win_popup_controller';

export class ExtendedEpicWinPopupProvider extends EpicWinPopupProvider {
  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string = 'big_win_new/scene_mobile',
    soundName: string = 'big_win_new/sound',
    startAfterShortWinLines: boolean = false,
    featureName?: string[],
    ignoreOnStartRespins: boolean = false
  ) {
    super(
      container,
      sceneCommon,
      sceneName,
      soundName,
      startAfterShortWinLines,
      featureName!,
      ignoreOnStartRespins
    );
  }

  protected createController(): void {
    const view = new ExtendedEpicWinPopupView(
      this.container,
      this.rootScene,
      this.popupScene,
      this.popupSoundScene,
      this.newLobbyEpicWinConfiguration
    );
    this.popupController = new ExtendedEpicWinPopupController(
      this.container,
      view,
      this.newLobbyEpicWinConfiguration,
      true,
      this.startAfterShortWinLines,
      this.featureName ?? undefined,
      this.ignoreOnStartRespins
    );

    this.subscribeEvents();
  }
}
