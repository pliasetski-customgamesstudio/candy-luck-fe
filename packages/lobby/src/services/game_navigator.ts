import { EventDispatcher, EventStream } from '@cgs/syd';
import { IGameNavigator } from '@cgs/machines';
import { ICustomGamesGame } from '@cgs/features';
import { ISimpleUserInfoHolder, T_GameOperation } from '@cgs/common';
import { DownloadPriority, IMachineDownloader } from '@cgs/common';
import { GameOperation } from '@cgs/machines';
import { IGameStartupHandler } from '@cgs/machines';
import { Machine } from '@cgs/network';
import { IGameActionsScheduler } from '@cgs/features';
import { MachineExtensions } from '@cgs/common';
import { MachineDownloaderEx } from '@cgs/common';
import { GameIds } from '@cgs/machines';
import { BackToLobbyGameResult, GameResult, GoToMachineGameResult } from '@cgs/features';
import { LangEx } from '@cgs/shared';
import { LobbyPosition } from '@cgs/features';

export class GameNavigator implements IGameNavigator {
  private _game: ICustomGamesGame;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _machineDownloader: IMachineDownloader;
  private _currentGameOperation: GameOperation | null;
  private _startingMachine: boolean = false;
  private _gameStartupHandler: IGameStartupHandler | null;

  public backToLobby: EventStream<void>;
  public startedMachine: EventStream<Machine>;
  private _machineStartedDispatcher: EventDispatcher<string> = new EventDispatcher<string>();
  public get machineStarted(): EventStream<string> {
    return this._machineStartedDispatcher.eventStream;
  }

  constructor(
    game: ICustomGamesGame,
    machineDownloader: IMachineDownloader,
    userInfoHolder: ISimpleUserInfoHolder
  ) {
    this._game = game;
    this._machineDownloader = machineDownloader;
    this._userInfoHolder = userInfoHolder;
  }

  public get activeMachine(): Machine | null {
    return this.currentGameOperation && !this.currentGameOperation.isCompleted
      ? this.currentGameOperation.machineInfo
      : null;
  }

  private _counter: number = 0;

  public deactivateGame(): void {
    this._counter++;
    this.currentGameOperation?.deactivateGame();
  }

  public activateGame(): void {
    this._counter--;
    if (this._counter <= 0) {
      this._counter = 0;
      this.currentGameOperation?.activateGame();
    }
  }

  public getActionScheduler(): IGameActionsScheduler | null {
    const operation = this.currentGameOperation;
    if (!operation || operation.isCompleted) {
      return null;
    }
    return operation;
  }

  public availableForCurrentLevel(machine: Machine): boolean {
    if (MachineExtensions.isFeatured(machine)) {
      return true;
    }

    return true;

    // if (typeof machine.availableFromLevel !== 'number') {
    //   return true;
    // } else {
    //   return this._userInfoHolder.user.level >= machine.availableFromLevel;
    // }
  }

  public availableForCurrentVersion(_machine: Machine): boolean {
    //We have only one build version of web client
    return true;
    // if (typeof machine.clientVersion !== 'number') {
    //   return true;
    // }
    // return DeviceInfoEx.getAppVersion() >= machine.clientVersion;
  }

  public canStartMachine(machine: Machine, force: boolean): boolean {
    if (MachineExtensions.isMaintenance(machine) || MachineExtensions.isComingSoon(machine))
      return false;

    return (
      MachineDownloaderEx.isGameReady(this._machineDownloader, machine) &&
      this._machineDownloader.chekMachinePack(machine) &&
      GameIds.isGameCodeExists(machine.id) &&
      (this.availableForCurrentLevel(machine) || MachineExtensions.isFeatured(machine) || force) &&
      this.availableForCurrentVersion(machine) &&
      !MachineExtensions.isComingSoon(machine) &&
      !MachineExtensions.isMaintenance(machine) &&
      !MachineExtensions.isUpdateRequired(machine)
    );
  }

  public isGameCodeExists(machine: Machine): boolean {
    return GameIds.isGameCodeExists(machine.id);
  }

  public get currentGameOperation(): GameOperation | null {
    return this._currentGameOperation;
  }

  public async loadingMachine(_gameOperation: GameOperation): Promise<void> {
    if (this._startingMachine) {
      this._startingMachine = false;

      const handler = this._gameStartupHandler;
      if (handler) {
        handler.handleGameLoading();
      }
    }
  }

  public registerGameStartupHandler(gameStartupHandler: IGameStartupHandler): void {
    this._gameStartupHandler = gameStartupHandler;
  }

  public unregisterGameStartupHandler(_gameStartupHandler: IGameStartupHandler): void {
    this._gameStartupHandler = null;
  }

  public async startMachine(machine: Machine): Promise<GameResult> {
    let targetMachine: Machine | null = machine;

    try {
      this._startingMachine = true;
      let result: GameResult = new BackToLobbyGameResult();
      do {
        result = await LangEx.usingAsync(
          this._game.rootContext.startChildCounterSection(),
          async () => {
            const context = await this._game.rootContext.startChildContext();
            this._game.rootContext.viewContext.showSpinner();
            return await LangEx.usingAsync(context, async (childContext) => {
              let result: GameResult = new BackToLobbyGameResult();
              let operation: GameOperation;
              try {
                this._currentGameOperation = childContext.initOperation(T_GameOperation, [
                  targetMachine,
                ]);
                this._machineStartedDispatcher.dispatchEvent(targetMachine!.id);
                operation = await childContext.startOperation(this.currentGameOperation);
              } finally {
                this._currentGameOperation = null;
              }
              if (operation.isCompleted) {
                result = operation.result;
                if (result instanceof GoToMachineGameResult) {
                  targetMachine = result.targetMachine;
                  // return scroll to machine result if can't start machine
                  if (!this.canStartMachine(targetMachine, result.force)) {
                    if (!MachineDownloaderEx.isGameReady(this._machineDownloader, targetMachine)) {
                      this._machineDownloader.downloadMachine(
                        targetMachine,
                        DownloadPriority.Medium
                      );
                    }
                    result = new BackToLobbyGameResult(LobbyPosition.Games, targetMachine);
                    targetMachine = null;
                  }
                } else {
                  targetMachine = null;
                }
              }
              return new Promise<GameResult>((resolve) => resolve(result));
            });
          }
        );
      } while (targetMachine);

      return result;
    } finally {
      this._startingMachine = false;
    }
  }

  public async unloadingMachine(gameOperation: GameOperation): Promise<void> {
    const isRedirected =
      gameOperation.isCompleted &&
      gameOperation.result instanceof GoToMachineGameResult &&
      this.canStartMachine(gameOperation.result.targetMachine, gameOperation.result.force);

    if (!isRedirected) {
      const handler = this._gameStartupHandler;
      if (handler) {
        await handler.handleGameUnloading();
      }
    }
  }

  public completeGame(gameResult: GameResult): void {
    this.currentGameOperation?.complete(gameResult);
  }

  public updateBets(): void {
    const operation = this.currentGameOperation;
    operation?.updateBets();
  }
}
