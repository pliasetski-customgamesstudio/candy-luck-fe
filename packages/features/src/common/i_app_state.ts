import { Machine } from '@cgs/network';
import { EventStream } from '@cgs/syd';
import { GameResult } from './game_result';
import { IGameActionsScheduler } from './i_game_actions_scheduler';

export interface IAppState {
  startedMachine: EventStream<Machine>;
  backToLobby: EventStream<void>;
  activeMachine: Machine | null;
  completeGame(gameResult: GameResult): void;
  deactivateGame(): void;
  activateGame(): void;
  getActionScheduler(): IGameActionsScheduler | null;
}
