import {
  CompositeController,
  ScaleManager,
  ICoordinateSystemInfoProvider,
  IClientProperties,
  CompositeChildRegistration,
  T_GameController,
  IController,
} from '@cgs/common';
import { IAppState } from '@cgs/features';
import { NodeUtils } from '@cgs/shared';
import { SceneObject, T_SceneObject } from '@cgs/syd';
import { AbstractSlotGame } from './default_game/abstract_slot_game';
import { GameController } from './game_controller';
import { GameOperation } from './game_operation';

export class CompositeGameController extends CompositeController<GameOperation, SceneObject> {
  private _scaleManager: ScaleManager;
  get scaleManager(): ScaleManager {
    return this._scaleManager;
  }
  private _coordinateSystemProvider: ICoordinateSystemInfoProvider;
  get coordinateSystemProvider(): ICoordinateSystemInfoProvider {
    return this._coordinateSystemProvider;
  }

  // private _lobbyScalerSub: StreamSubscription;
  // set lobbyScalerSub(value: StreamSubscription) {
  //   this._lobbyScalerSub = value;
  // }
  // private _gamesScalerSub: StreamSubscription;
  // set gamesScalerSub(value: StreamSubscription) {
  //   this._gamesScalerSub = value;
  // }

  private static _fullScreenTutorialDisplayed: boolean = false;
  static get fullScreenTutorialDisplayed(): boolean {
    return this._fullScreenTutorialDisplayed;
  }
  static set fullScreenTutorialDisplayed(value: boolean) {
    this._fullScreenTutorialDisplayed = value;
  }

  private readonly _clientProperties: IClientProperties;
  get clientProperties(): IClientProperties {
    return this._clientProperties;
  }
  private readonly _appState: IAppState;
  get appState(): IAppState {
    return this._appState;
  }

  constructor(
    view: SceneObject,
    operation: GameOperation,
    clientProperties: IClientProperties,
    scaleManager: ScaleManager,
    coordinateSystemProvider: ICoordinateSystemInfoProvider,
    appState: IAppState
  ) {
    super(view, operation);
    this._clientProperties = clientProperties;
    this._scaleManager = scaleManager;
    this._coordinateSystemProvider = coordinateSystemProvider;
    this._appState = appState;
  }

  onStart(): void {
    const slotGame = this.operation.gameView as AbstractSlotGame;

    slotGame.start();
  }

  async onInitializeAsync(): Promise<void> {
    await super.onInitializeAsync();

    //var topPanel = getChild(ITopPanelController).view;
    //var gameView = getChild(GameController).view;

    //    await initializeScaler();
    //
    //    _lobbyScalerSub = _scaleManager.lobbyScaler.addScaleChangedListener((info) => {
    //      topPanel.scale = info.scale;
    //      topPanel.position = info.position;
    //      progressiveJackpotPanel.scale = info.scale;
    //      progressiveJackpotPanel.position = info.position;
    //    });
    //
    //    _gamesScalerSub = _scaleManager.gamesScaler.addScaleChangedListener((info) => {
    //      gameView.scale = info.scale;
    //      gameView.position = info.position;
    //    });
  }

  //  Future initializeScaler() async {
  //    var gameView = getChild(GameController).view;
  //    var topPanel = getChild(ITopPanelController).view;
  //    var footer = gameView.findById("footer");
  //
  //    CompositeContestController compositeContestController = getChild(CompositeContestController);
  //    var contest = compositeContestController.getChild(ContestController).view;
  //
  //    var contestBounds = contest.bounds;
  //    var bg = gameView.findById("background");
  //    // var bgMinBounds = bg.findById("minBounds");
  //    // var bgMaxBounds = bg.findById("maxBounds");
  //    var bgMinBounds = new SceneObject()
  //      ..id = "minBounds"
  //      ..size = new Vector2(1152.0, 768.0)
  //      ..position = new Vector2(0.0, 0.0);
  //    bg.addChild(bgMinBounds);
  //    var bgMaxBounds = new SceneObject()
  //      ..id = "maxBounds"
  //      ..size = new Vector2(1152.0, 768.0)
  //      ..position = new Vector2(0.0, 0.0);
  //    bg.addChild(bgMaxBounds);
  ////    var footerBounds = footer.bounds;
  //
  ////    var footerBounds = new Rect(new Vector2(0.0, 0.0), new Vector2(1152.0, 768.0));
  //    var footerBounds = new Rect(new Vector2(0.0, 0.0), new Vector2(0.0, 0.0));;
  //
  //    if(bgMinBounds && bgMaxBounds) {
  //      //Some slots have bounds that are places not in the root node
  //      var minBoundsPosition = NodeUtils.worldPosition(bgMinBounds, bg);
  //      var maxBoundsPosition = NodeUtils.worldPosition(bgMaxBounds, bg);
  //      await _scaleManager.gamesScaler.initializeDynamic([
  //        new ScaleEntry(
  //            new Rectangle(minBoundsPosition.x, minBoundsPosition.y, bgMinBounds.size.x, bgMinBounds.size.y),
  //            new Rectangle(maxBoundsPosition.x, maxBoundsPosition.y, bgMaxBounds.size.x, bgMaxBounds.size.y), true,
  //            true),
  //        new ScaleEntry(
  //            new Rectangle(footerBounds.lt.x, footerBounds.lt.y, footerBounds.width, footerBounds.height),
  //            null,
  //            false, true),
  //        new ScaleEntry(
  //            new Rectangle(contestBounds.lt.x, contestBounds.lt.y, contestBounds.width, contestBounds.height),
  //            null,
  //            false, true)
  //      ], () => new Rectangle(0.0, 0.0, 1152.0, 768.0)
  //
  ////              () => new Rectangle(0.0, topPanel.bounds.size.y * topPanel.worldTransform.d,
  ////          _coordinateSystemProvider.coordinateSystem.width, _coordinateSystemProvider.coordinateSystem.height - topPanel.bounds.size.y * topPanel.worldTransform.d)
  //      );
  //    }
  //  }

  get childRegistrations(): CompositeChildRegistration[] {
    return [new CompositeChildRegistration(T_GameController, T_SceneObject)];
  }

  onStop(): void {
    //    _gamesScalerSub?.cancel();
    //    _lobbyScalerSub?.cancel();
    //    _scaleManager.gamesScaler.stop();

    if (this.view.parent) {
      this.view.parent.removeChild(this.view);
      if (this.operation.gameView?.parent === this.view) {
        this.view.removeChild(this.operation.gameView);
      }

      this.operation.gameView?.dispose();
    }
    super.onStop();
  }

  //View's should be destroyed only after all controllers are stopped.
  async stop(): Promise<void> {
    await super.stop();
    NodeUtils.traverseAll(this.view, (disp) => {
      disp.dispose();
    });
    this.view.deinitialize();
  }

  initCompositeChild(
    childRegistration: CompositeChildRegistration,
    root: SceneObject,
    parameters: GameOperation
  ): IController {
    if (childRegistration.childType == T_GameController) {
      const gameController = new GameController(
        this.operation.gameView as SceneObject,
        this.operation
      );
      root.addChild(gameController.view as SceneObject);
      return gameController;
    }
    return super.initCompositeChild(childRegistration, root, parameters);
  }
}
