import { GameResult } from '@cgs/features';
import { IGameStartupHandler } from './i_game_startup_handler';
import { GameOperation } from './game_operation';
import { EventStream } from '@cgs/syd';
import { Machine } from '@cgs/network';
import { IGameAvailabilityCheck } from '@cgs/features';
import { IBetsUpdater } from '@cgs/features';

export interface IGameNavigator extends IGameAvailabilityCheck, IBetsUpdater {
  startMachine(machine: Machine): Promise<GameResult>;

  get currentGameOperation(): GameOperation | null;
  registerGameStartupHandler(gameStartupHandler: IGameStartupHandler): void;
  unregisterGameStartupHandler(gameStartupHandler: IGameStartupHandler): void;

  loadingMachine(gameOperation: GameOperation): Promise<void>;
  unloadingMachine(gameOperation: GameOperation): Promise<void>;
  get machineStarted(): EventStream<string>;
}
