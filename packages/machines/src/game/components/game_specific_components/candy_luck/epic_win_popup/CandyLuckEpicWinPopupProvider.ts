import { Container, EventDispatcher, IDisposable, IStreamSubscription } from '@cgs/syd';
import { SceneCommon } from '@cgs/common';
import { EpicWinConfiguration } from '../../../epic_win/epic_win_configuration';
import { EpicWinStep, EpicWinStepName } from '../../../epic_win/epic_win_step';
import { EpicWinPopupView } from '../../../../common/slot/views/epic_win_popup_view';
import { BasePopupComponent } from '../../../popups/base_popup_component';
import { CandyLuckEpicWinPopupController } from './CandyLuckEpicWinPopupController';
import { CandyLuckEpicWinPopupView } from './CandyLuckEpicWinPopupView';

export class CandyLuckEpicWinPopupProvider
  extends BasePopupComponent<EpicWinPopupView>
  implements IDisposable
{
  private _container: Container;
  get container(): Container {
    return this._container;
  }
  private _startAfterShortWinLines: boolean;
  private _featureName: string[] | null;
  get featureName(): string[] | null {
    return this._featureName;
  }
  protected newLobbyEpicWinConfiguration: EpicWinConfiguration = new EpicWinConfiguration(
    [
      new EpicWinStep(1, EpicWinStepName.BigWin, 5.0, 0, 25),
      new EpicWinStep(2, EpicWinStepName.MegaWin, 5.0, 25, 50),
      new EpicWinStep(3, EpicWinStepName.EpicWin, 5.0, 50, 10000000000),
    ],
    0.0,
    0.8,
    0.0,
    0.8
  );

  private _epicWinClosedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  private _epicWinSub: IStreamSubscription;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    sceneName: string = 'big_win_new/scene_mobile',
    soundName: string = 'big_win_new/sound',
    startAfterShortWinLines: boolean = false,
    featureName: string[] | null = null
  ) {
    super(container, sceneCommon, sceneName, false, soundName);
    console.log('load ' + this.constructor.name);
    this._container = container;
    this._featureName = featureName ?? null;
    this._startAfterShortWinLines = startAfterShortWinLines;
    this.createController();
  }

  protected createController(): void {
    const view = new CandyLuckEpicWinPopupView(
      this._container,
      this.rootScene,
      this.popupScene,
      this.popupSoundScene!,
      this.newLobbyEpicWinConfiguration
    );
    this.popupController = new CandyLuckEpicWinPopupController(
      this._container,
      view,
      this.newLobbyEpicWinConfiguration,
      true,
      this._startAfterShortWinLines
    );

    this.subscribeEvents();
  }

  protected subscribeEvents(): void {
    this._epicWinSub = (
      this.popupController as CandyLuckEpicWinPopupController
    ).epicWinClosed.listen((_e) => {
      this._epicWinClosedDispatcher.dispatchEvent();
    });
  }

  dispose(): void {
    this.popupScene.deinitialize();
    this._epicWinSub?.cancel();
  }
}
