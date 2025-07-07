import { IDisposable, SceneObject, Container, SoundSceneObject } from '@cgs/syd';
import {
  T_IHudCoordinator,
  T_AutoSpinPanelViewController,
  T_HudStateController,
  T_ISpinController,
  T_TotalBetController,
  T_WinTextController,
  T_FastSpinsController,
  T_ResourcesComponent,
  T_TutorialComponent,
} from '../../../type_definitions';
import { AutoSpinPanelViewController } from './controllers/auto_spin_panel_view_controller';
import { ChangeBetButtonsController } from './controllers/change_bet_buttons_controller';
import { FastSpinsController } from './controllers/fast_spins_controller';
import { HudStateController } from './controllers/hud_state_controller';
import { MaxBetButtonController } from './controllers/max_bet_button_controller';
import { PaytableButtonController } from './controllers/paytable_button_controller';
import { SpinController } from './controllers/spin_controller';
import { TotalBetController } from './controllers/total_bet_controller';
import { WinTextController } from './controllers/win_text_controller';
import { IHudCoordinator } from './i_hud_coordinator';
import { AutoSpinPanelView } from './views/auto_spin_panel_view';
import { ChangeBetButtonsView } from './views/change_bet_buttons_view';
import { FastSpinsView } from './views/fast_spins_view';
import { MaxBetButtonView } from './views/max_bet_button_view';
import { NewTotalBetView } from './views/new_total_bet_view';
import { PaytableButtonView } from './views/paytable_button_view';
import { SpinView } from './views/spin_view';
import { WinTextView } from './views/win_text_view';
import { TutorialComponent } from './components/TutorialComponent';
import { ResourcesComponent } from '../../components/resources_component';
import { SoundInstance } from '../../../reels_engine/sound_instance';

export class FooterController implements IDisposable {
  private readonly _scene: SceneObject;
  private readonly _autoSpinScene: SceneObject;
  private readonly _betScene: SceneObject;
  private readonly _container: Container;
  private _controllers: any[] = [];

  constructor(
    scene: SceneObject,
    betScene: SceneObject,
    autoSpinScene: SceneObject,
    container: Container
  ) {
    this._scene = scene;
    this._betScene = betScene;
    this._autoSpinScene = autoSpinScene;
    this._container = container;

    const resourcesComponent = container.resolve<ResourcesComponent>(T_ResourcesComponent);

    const buttonClickSoundScene = resourcesComponent?.sounds
      .findById<SoundSceneObject>('button_click')
      ?.findAllByType(SoundSceneObject)[0];
    const buttonClickSound = new SoundInstance(buttonClickSoundScene || null);

    const startButtonSoundScene = resourcesComponent?.sounds
      .findById<SoundSceneObject>('start_button')
      ?.findAllByType(SoundSceneObject)[0];
    const spinSound = new SoundInstance(startButtonSoundScene || null);

    const ap = new AutoSpinPanelView(this._autoSpinScene, this._container, buttonClickSound);
    const autoController = new AutoSpinPanelViewController(this._container, ap);
    this._controllers.push(autoController);
    this._container
      .register(() => autoController)
      .as(T_AutoSpinPanelViewController)
      .singleInstance();

    const hudStateController = new HudStateController(this._container, this._scene);
    this._container
      .register(() => hudStateController)
      .as(T_HudStateController)
      .singleInstance();

    const gamble = this._scene.findById('gamble');
    if (gamble) {
      gamble.touchable = false;
    }

    const paytableButtonView = new PaytableButtonView(this._scene, buttonClickSound);
    new PaytableButtonController(this._container, paytableButtonView);

    const spin = new SpinView(this._scene, this._container, spinSound, buttonClickSound);
    const spinController = new SpinController(this._container, spin);
    this._container
      .register(() => spinController)
      .as(T_ISpinController)
      .singleInstance();

    const footerTextsView = new WinTextView(this._scene);
    const footerTextsController =
      this._container.forceResolve<WinTextController>(T_WinTextController);
    footerTextsController.initialize(footerTextsView);

    const footerTotalBetView = new NewTotalBetView(this._scene);

    const footerTotalBetController =
      this._container.forceResolve<TotalBetController>(T_TotalBetController);
    footerTotalBetController.initialize(footerTotalBetView);

    const changeBetButtonsView = new ChangeBetButtonsView(this._scene);
    new ChangeBetButtonsController(this._container, changeBetButtonsView);

    const maxBetButtonView = new MaxBetButtonView(
      this._container,
      this._scene,
      this._betScene,
      buttonClickSound
    );
    const maxBetBettonController = new MaxBetButtonController(this._container, maxBetButtonView);
    this._controllers.push(maxBetBettonController);

    const fsv = new FastSpinsView(this._scene, this._container, buttonClickSound);
    const fastSpinController = new FastSpinsController(this._container, fsv);
    this._controllers.push(fastSpinController);
    this._container
      .register(() => fastSpinController)
      .as(T_FastSpinsController)
      .singleInstance();

    const tutorialComponent = this._container.forceResolve<TutorialComponent>(T_TutorialComponent);
    tutorialComponent.initialize();

    this._container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    // const autoSpinCheckboxView = this._container.resolve(EmptyAutoSpinCheckboxView) as EmptyAutoSpinCheckboxView ?? new EmptyAutoSpinCheckboxView(this._scene);
    // autoSpinCheckboxView.initialize();
    // const spinCheckboxController = new AutoSpinCheckboxController(autoSpinCheckboxView, this._container);
    // this._controllers.push(spinCheckboxController);

    // this._container.register((c) => changeBetButtonsController).as(AutoSpinCheckboxController).singleInstance();
  }

  slotLoadFinished(): void {
    for (const controller of this._controllers) {
      controller.slotLoadFinished();
    }
  }

  dispose(): void {
    for (const controller of this._controllers) {
      controller?.dispose();
    }

    this._controllers = [];
  }
}
