import {
  AsyncOperationWithResultBase,
  IBackHandler,
  INavigationStack,
  IController,
} from '@cgs/common';
import { BackToLobbyGameResult, ICustomGamesGame } from '@cgs/features';
import { ITopPanelContainerOperation, TopPanelContainerType } from '@cgs/machines';
import { ApplicationGameConfig, IocContainer } from '@cgs/shared';
// import { StartupTimeMetter } from '@cgs/common';
import { IOperationContext } from '@cgs/common';
import { T_IGameNavigator, T_InitSettingsOperation, T_StartupOnlySlotOperation } from '@cgs/common';
import { NoAnimationAnimationFactory } from '@cgs/common';
import { Completer } from '@cgs/syd';
import { Logger } from '@cgs/shared';
import { ICanvasManager, T_ICanvasManager } from '@cgs/common';
import { Machine } from '@cgs/network';
import { IGameNavigator } from '@cgs/machines';
import { ServerException } from '@cgs/network';

export class ShowLobbyOnlySlot
  extends AsyncOperationWithResultBase<BackToLobbyGameResult>
  implements ITopPanelContainerOperation, IBackHandler
{
  private _container: IocContainer;

  get containerType(): TopPanelContainerType {
    return TopPanelContainerType.lobby;
  }

  private _customGamesGame: ICustomGamesGame;
  private _navigationStack: INavigationStack;
  private controller: IController;

  // private _startupTimeMetter: StartupTimeMetter;

  get container(): IocContainer {
    return this._container;
  }

  get customGamesGame(): ICustomGamesGame {
    return this._customGamesGame;
  }

  // get startupTimeMetter(): StartupTimeMetter {
  //   return this._startupTimeMetter;
  // }

  get navigationStack(): INavigationStack {
    return this._navigationStack;
  }

  constructor(
    context: IOperationContext,
    container: IocContainer,
    customGamesGame: ICustomGamesGame,
    navigationStack: INavigationStack
    //,startupTimeMetter: StartupTimeMetter
  ) {
    super(context);
    this._container = container;
    this._customGamesGame = customGamesGame;
    this._navigationStack = navigationStack;
    // this._startupTimeMetter = startupTimeMetter;
  }

  async internalExecute(): Promise<void> {
    this._navigationStack.register(this);

    // this._startupTimeMetter.startTracking('LoadLobbyFull');
    await this.context.startOperationByType(T_InitSettingsOperation);
    this.context.viewContext.animationFactory = new NoAnimationAnimationFactory();
    const completer = new Completer<void>();
    this.controller = (await this.loginAndLoadSlot(completer))!;
    await completer.promise;
    await this.scrollToTop();
    await this.controller.start();
    // this._startupTimeMetter.stopTracking('LoadLobbyFull');

    // const times = this._startupTimeMetter.measuredTimes.toString();
    Logger.Info('Startup tiume metter , $times');

    this.complete(new BackToLobbyGameResult());
  }

  handleBackKey(): boolean {
    return false;
  }

  async scrollToTop(): Promise<void> {
    const canvasManger = this._container.resolve<ICanvasManager>(T_ICanvasManager)!;
    const pageInfo = await canvasManger.getPageInfo();
    canvasManger.scrollTo(0, pageInfo.offsetTop);
  }

  async startMachine(): Promise<any> {
    const machine = new Machine();
    machine.id = ApplicationGameConfig.machineId;
    const gameNavigator = this.container.resolve<IGameNavigator>(T_IGameNavigator)!;
    return await gameNavigator.startMachine(machine);
  }

  async loginAndLoadSlot(completer: Completer<void>): Promise<IController | null> {
    // let controller = null;
    //
    try {
      this.context.viewContext.splashManager.step();
      // while (true) {
      try {
        await this.context.startOperationByType(T_StartupOnlySlotOperation);
      } catch (e) {
        if (e instanceof ServerException) {
          Logger.Error('Server error in startup $e');
          // await this.context.startChildOperationByType(T_ServerErrorOperation);
          // continue;
        } else {
          Logger.Error('Error in startup, $e, $st');
          throw e;
        }
      }
      // break;
      // }

      this.context.viewContext.splashManager.step();

      await this.startMachine();

      completer.complete();
    } catch (e) {
      Logger.Error('Loading exception $e\n$st');
    }
    return null;
  }

  async finishExecution(): Promise<void> {}
}
