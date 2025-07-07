import {
  AsyncOperationWithResultBase,
  IBackHandler,
  IControllerFactory,
  IBalanceRefreshService,
  ScaleManager,
  IOperationContext,
  NoAnimationAnimationFactory,
  ISlotsApiService,
  T_CompositeGameController,
  ReBuyFreeSpinsResult,
  ISpinResponse,
} from '@cgs/common';
import {
  GameResult,
  IGameActionsScheduler,
  ICustomGamesGame,
  BackToLobbyGameResult,
} from '@cgs/features';
import { Machine } from '@cgs/network';
import { IocContainer, Func0, Logger, ArkadiumSdk, AlertManager } from '@cgs/shared';
import { SceneObject, Container, StopWatch } from '@cgs/syd';
import { CompositeGameController } from './composite_game_controller';
import { BaseSlotGame } from './game/base_slot_game';
import { IBalanceUpdater } from './game/components/balance_listener_provider';
import { IGameLauncher } from './i_game_launcher';
import { IGameNavigator } from './i_game_navigator';
import { ISomethingWentWrongShower } from './i_something_went_wrong_shower';
import { ITopPanelContainerOperation } from './i_top_panel_container_operation';
import { IUnlockMachinesHandler } from './i_unlock_machines_handler';
import { LobbyFacade } from './lobby_facade';
import { ISlotGame } from './reels_engine/i_slot_game';
import { FreeSpinsInfoConstants } from './reels_engine/state_machine/free_spins_info_constants';
import {
  GameStateMachineStates,
  GameStateMachine,
} from './reels_engine/state_machine/game_state_machine';
import { TopPanelContainerType } from './top_panel_container_type';

export class GameOperation
  extends AsyncOperationWithResultBase<GameResult>
  implements
    ITopPanelContainerOperation,
    IUnlockMachinesHandler,
    ISomethingWentWrongShower,
    IGameActionsScheduler,
    IBackHandler
{
  private _machineInfo: Machine;
  private _gameLauncher: IGameLauncher;
  private _controllerFactory: IControllerFactory;
  private _scope: IocContainer;
  private _balanceUpdater: IBalanceUpdater;
  private _slotApiService: ISlotsApiService;
  private _balanceRefreshService: IBalanceRefreshService;
  private _game: ICustomGamesGame;
  private _scaleManager: ScaleManager;
  private _gameRoot: SceneObject;
  private _gameView: ISlotGame | null;
  private _gameNavigator: IGameNavigator;
  private _destroyCount: number;
  private _scheduledAction: Func0<Promise<void>>;
  private _container: Container;
  private _controller: CompositeGameController;
  private readonly _alertManager: AlertManager;

  constructor(
    machineInfo: Machine,
    context: IOperationContext,
    gameLauncher: IGameLauncher,
    controllerFactory: IControllerFactory,
    slotApiService: ISlotsApiService,
    scope: IocContainer,
    balanceUpdater: IBalanceUpdater,
    gameNavigator: IGameNavigator,
    game: ICustomGamesGame,
    scaleManager: ScaleManager,
    balanceRefreshService: IBalanceRefreshService,
    alertManager: AlertManager
  ) {
    super(context);
    this._machineInfo = machineInfo;
    this._gameLauncher = gameLauncher;
    this._controllerFactory = controllerFactory;
    this._slotApiService = slotApiService;
    this._scope = scope;
    this._balanceUpdater = balanceUpdater;
    this._gameNavigator = gameNavigator;
    this._game = game;
    this._scaleManager = scaleManager;
    this._balanceRefreshService = balanceRefreshService;
    this._destroyCount = 0;
    this._alertManager = alertManager;
  }

  public get gameLauncher(): IGameLauncher {
    return this._gameLauncher;
  }

  public get controllerFactory(): IControllerFactory {
    return this._controllerFactory;
  }

  public get scope(): IocContainer {
    return this._scope;
  }

  public get balanceUpdater(): IBalanceUpdater {
    return this._balanceUpdater;
  }

  public get slotApiService(): ISlotsApiService {
    return this._slotApiService;
  }

  public get balanceRefreshService(): IBalanceRefreshService {
    return this._balanceRefreshService;
  }

  public get game(): ICustomGamesGame {
    return this._game;
  }

  public get scaleManager(): ScaleManager {
    return this._scaleManager;
  }

  public get gameRoot(): SceneObject {
    return this._gameRoot;
  }

  public set gameRoot(value: SceneObject) {
    this._gameRoot = value;
  }

  public get gameViewInner(): ISlotGame {
    return this._gameView!;
  }

  public set gameViewInner(value: ISlotGame) {
    this._gameView = value;
  }

  public get gameNavigator(): IGameNavigator {
    return this._gameNavigator;
  }

  public get destroyCount(): number {
    return this._destroyCount;
  }

  public get scheduledAction(): Func0<Promise<void>> {
    return this._scheduledAction;
  }

  public set scheduledAction(value: Func0<Promise<void>>) {
    this._scheduledAction = value;
  }

  public get container(): Container {
    return this._container;
  }

  public set container(value: Container) {
    this._container = value;
  }

  public get controller(): CompositeGameController {
    return this._controller;
  }

  public set controllerInner(value: CompositeGameController) {
    this._controller = value;
  }

  public get containerType(): TopPanelContainerType {
    return TopPanelContainerType.game;
  }

  public get gameView(): SceneObject | null {
    const gameView = this._gameView;
    return gameView?.gameNode || null;
  }

  public get machineInfo(): Machine {
    return this._machineInfo;
  }

  public async internalExecute(): Promise<void> {
    try {
      const loadingTimeMeter = new StopWatch();
      loadingTimeMeter.start();
      this.context.viewContext.animationFactory = new NoAnimationAnimationFactory();
      this._gameRoot = await this.showGameRoot();

      await Promise.all([this._balanceRefreshService.refreshBalance()]);

      this._gameLauncher.initLauncher(this._initLobbyFacade());

      const preloader = await this._gameLauncher.initPreloader();
      preloader.addSteps(4);
      this._gameRoot.addChild(preloader);

      ArkadiumSdk.getInstance().onTestReady();

      await this._gameNavigator.loadingMachine(this);
      this._gameView = await this._gameLauncher.initGameView();
      if (!this._gameView) {
        this.complete(new BackToLobbyGameResult());
      } else {
        this._controller = this._controllerFactory.initComposite(T_CompositeGameController, [
          this,
        ]) as CompositeGameController;
        this._controller.view.initialize();
        await this._controller.initialize();
        preloader.step();
        this.controller.view.visible = false;
        this._gameRoot.addChild(this.controller.view);

        await this.controller.start();
        preloader.z = 1000000;
        preloader.step();
        await this.waitForGameStateMachineInitCompleted();
        this.controller.view.visible = true;
        preloader.z = 0;
        await preloader.finish();
        preloader.deinitialize();

        ArkadiumSdk.getInstance().onGameStart();

        for (const child of this._gameRoot.childs) {
          if (child != this.controller.view) {
            child.parent?.removeChild(child);
            child.deinitialize();
          }
        }
        this._game.rootContext.viewContext.hideSpinner();
      }
    } catch (e) {
      Logger.Error(`Error on staring machine ${e}`);
      this._alertManager.show('Error', 'Something went wrong, please try again later', true);
      throw e;
    }
  }

  public async waitForGameStateMachineInitCompleted(): Promise<void> {
    this.gameView!.visible = false;
    const view = this.gameView as BaseSlotGame;
    if (view) {
      await view.slotStateMachineInitCompleted;
    }
    this.gameView!.visible = true;
  }

  public _initLobbyFacade(): LobbyFacade {
    return new LobbyFacade(
      this,
      this._slotApiService,
      this._balanceUpdater,
      this,
      this._gameNavigator,
      this._scope,
      this,
      this._scaleManager
    );
  }

  public async finishExecution(): Promise<void> {
    await this.cleanup();
  }

  public async showGameRoot(): Promise<SceneObject> {
    const gameRoot = new SceneObject();
    gameRoot.initialize();
    await this.context.viewContext.show(gameRoot);
    this.context.viewContext.hideFogging();
    this.context.viewContext.hideSpinner();
    return gameRoot;
  }

  public async cleanup(): Promise<void> {
    await this._gameNavigator.unloadingMachine(this);

    this._removeTresurePlaces();

    await this.destroyGame();
  }

  public registerTreausrePlaces(_treasure: SceneObject): void {}

  private _removeTresurePlaces(): void {}

  public async destroyGame(): Promise<void> {
    if (this._destroyCount > 1) {
      return;
    }
    this._destroyCount++;

    this._game.rootContext.viewContext.hideSpinner();
    this._gameView = null;
    if (this.controller) {
      await this.controller.stop();
    }
    this._balanceUpdater.resumeUpdate();

    await this.context.viewContext.hide(this._gameRoot);
    this._gameLauncher.dispose();
    this._destroyCount--;
  }

  public handleBackKey(): boolean {
    return true;
  }

  public async tryReBuyFreeSpins(
    _response: ISpinResponse,
    _container: Container
  ): Promise<ReBuyFreeSpinsResult> {
    return Promise.resolve(ReBuyFreeSpinsResult.empty);
  }

  public async displaySpinsPurchaseFailed(): Promise<void> {
    return Promise.resolve();
  }

  public async showSomethingWentWrong(): Promise<void> {}

  public deactivateGame(): void {
    const view = this.gameView;
    if (view) {
      view.active = false;
    }
  }

  public activateGame(): void {
    const view = this.gameView;
    if (view) {
      view.active = true;
    }
  }

  public updateBets(): void {
    if (this.isCompleted) {
      return;
    }

    const view = this.gameView as BaseSlotGame;

    if (view) {
      view.updateBets();
    }
  }

  public isBonus(): boolean {
    const stateMachine = this.getGameStateMachine();
    if (!stateMachine) {
      return false;
    }
    return (
      (stateMachine.curResponse && stateMachine.curResponse.isBonus) ||
      this.gameInState([
        GameStateMachineStates.BeginBonus,
        GameStateMachineStates.EndBonus,
        GameStateMachineStates.Bonus,
      ])
    );
  }

  public isFreeSpinsOrBonus(): boolean {
    const stateMachine = this.getGameStateMachine();
    if (!stateMachine) {
      return false;
    }
    return (
      stateMachine.curResponse &&
      (stateMachine.curResponse.isBonus ||
        stateMachine.curResponse.isRespin ||
        (stateMachine.curResponse.isFreeSpins &&
          stateMachine.curResponse.freeSpinsInfo?.event !=
            FreeSpinsInfoConstants.FreeSpinsFinished))
    );
  }

  public isFreeSpins(): boolean {
    const stateMachine = this.getGameStateMachine();
    if (!stateMachine) {
      return false;
    }
    return (
      stateMachine.curResponse &&
      stateMachine.curResponse.isFreeSpins &&
      stateMachine.curResponse.freeSpinsInfo?.event != FreeSpinsInfoConstants.FreeSpinsFinished
    );
  }

  public isFreeSpinsOrBonusPopup(): boolean {
    const stateMachine = this.getGameStateMachine();
    if (
      !stateMachine ||
      stateMachine.curResponse?.freeSpinsInfo?.name == 'torrid' ||
      stateMachine.curResponse?.freeSpinsInfo?.name == 'freeRespin'
    ) {
      return false;
    }
    return this.gameInState([
      GameStateMachineStates.ReBuyFreeSpinsPopup,
      GameStateMachineStates.BeginFreeSpins,
      GameStateMachineStates.BeginFreeSpinsPopup,
      GameStateMachineStates.BeginBonus,
      GameStateMachineStates.EndBonus,
      GameStateMachineStates.Bonus,
      GameStateMachineStates.EndOfFreeSpinsPopup,
      GameStateMachineStates.BonusRecovery,
      GameStateMachineStates.BeginScatter,
      GameStateMachineStates.Scatter,
    ]);
  }

  public isInFreeSpinsOrBonusPopup(): boolean {
    const stateMachine = this.getGameStateMachine()!;

    if (stateMachine.curResponse?.isFreeSpins == true) {
      if (
        stateMachine.curResponse?.freeSpinsInfo?.event !=
          FreeSpinsInfoConstants.FreeSpinsFinished &&
        stateMachine.curResponse?.freeSpinsInfo?.event != FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        return true;
      } else if (
        stateMachine.curResponse?.freeSpinsInfo?.event == FreeSpinsInfoConstants.FreeSpinsFinished
      ) {
        return !this.gameInState([
          GameStateMachineStates.RegularSpin,
          GameStateMachineStates.Accelerate,
          GameStateMachineStates.WaitRequest,
          GameStateMachineStates.MakeRequest,
        ]);
      } else if (
        stateMachine.curResponse?.freeSpinsInfo?.event == FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        if (
          this.gameInState([
            GameStateMachineStates.FreeSpin,
            GameStateMachineStates.Accelerate,
            GameStateMachineStates.WaitRequest,
            GameStateMachineStates.MakeRequest,
          ])
        ) {
          return true;
        }
      }
    }

    return this.gameInState([
      GameStateMachineStates.ReBuyFreeSpinsPopup,
      GameStateMachineStates.BeginFreeSpins,
      GameStateMachineStates.BeginFreeSpinsPopup,
      GameStateMachineStates.BeginBonus,
      GameStateMachineStates.EndBonus,
      GameStateMachineStates.Bonus,
      GameStateMachineStates.EndOfFreeSpinsPopup,
      GameStateMachineStates.BonusRecovery,
      GameStateMachineStates.BeginScatter,
      GameStateMachineStates.Scatter,
      GameStateMachineStates.EndScatter,
    ]);
  }

  public isLightningOrBonus(): boolean {
    const stateMachine = this.getGameStateMachine()!;

    if (stateMachine.curResponse?.isFreeSpins == true) {
      if (stateMachine.curResponse?.freeSpinsInfo?.name != 'freeRespin') {
        return false;
      }
      if (
        stateMachine.curResponse?.freeSpinsInfo?.event !=
          FreeSpinsInfoConstants.FreeSpinsFinished &&
        stateMachine.curResponse?.freeSpinsInfo?.event != FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        return true;
      } else if (
        stateMachine.curResponse?.freeSpinsInfo?.event == FreeSpinsInfoConstants.FreeSpinsFinished
      ) {
        return !this.gameInState([
          GameStateMachineStates.RegularSpin,
          GameStateMachineStates.Accelerate,
          GameStateMachineStates.WaitRequest,
          GameStateMachineStates.MakeRequest,
        ]);
      } else if (
        stateMachine.curResponse?.freeSpinsInfo?.event == FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        if (
          this.gameInState([
            GameStateMachineStates.FreeSpin,
            GameStateMachineStates.Accelerate,
            GameStateMachineStates.WaitRequest,
            GameStateMachineStates.MakeRequest,
          ])
        ) {
          return true;
        }
      }
    }

    return this.gameInState([
      GameStateMachineStates.ReBuyFreeSpinsPopup,
      GameStateMachineStates.BeginFreeSpins,
      GameStateMachineStates.BeginFreeSpinsPopup,
      GameStateMachineStates.BeginBonus,
      GameStateMachineStates.EndBonus,
      GameStateMachineStates.Bonus,
      GameStateMachineStates.EndOfFreeSpinsPopup,
      GameStateMachineStates.BonusRecovery,
      GameStateMachineStates.BeginScatter,
      GameStateMachineStates.Scatter,
      GameStateMachineStates.EndScatter,
    ]);
  }

  public getGameStateMachine(): GameStateMachine<ISpinResponse> | null {
    const gameView = this.gameView as BaseSlotGame;
    if (gameView?.isInitialized) {
      return gameView.getGameStateMachine();
    }

    return null;
  }

  public gameInState(states: string[]): boolean {
    const stateMachine = this.getGameStateMachine();

    if (stateMachine) {
      for (const state of states) {
        if (stateMachine.rootState.isActive(state)) {
          return true;
        }
      }
    }

    return false;
  }

  public canShowRewardPopup(): boolean {
    return this.gameInState([GameStateMachineStates.Idle, GameStateMachineStates.RegularSpin]);
  }

  public scheduleAction(popupAction: Func0<Promise<void>>): void {
    const gameView = this.gameView;
    if (this.isCompleted || !gameView) {
      return;
    }
    if (this.canShowRewardPopup()) {
      popupAction();
    } else {
      this._scheduledAction = popupAction;
    }
  }
}

export class DeactivateParentSceneObject extends SceneObject {
  private _time: Date;

  constructor() {
    super();
    this._time = new Date();
  }

  public update(dt: number): void {
    super.update(dt);
    if (new Date().getTime() - this._time.getTime() > 500) {
      const parent = this.parent!;
      parent.active = false;
      parent.removeChild(this);
    }
  }
}
