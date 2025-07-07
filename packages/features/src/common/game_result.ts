import { Machine } from '@cgs/network';
import { LobbyPosition } from './lobby_position';

export interface GameResult {}

class LogoutGameResult implements GameResult {}

export class GoToMachineGameResult implements GameResult {
  private _targetMachine: Machine;
  get targetMachine(): Machine {
    return this._targetMachine;
  }
  private _force: boolean = false;
  get force(): boolean {
    return this._force;
  }

  constructor(targetMachine: Machine, force: boolean = false) {
    this._targetMachine = targetMachine;
    this._force = force;
  }
}

export class BackToLobbyGameResult implements GameResult {
  scrollToMachine: Machine | null;
  scrollToMachineId: string;
  lobbyPosition: LobbyPosition;
  scrollToPage: number;
  navigateFromChallenge: boolean;

  constructor(
    lobbyPosition: LobbyPosition = LobbyPosition.Games,
    scrollToMachine: Machine | null = null
  ) {
    this.lobbyPosition = lobbyPosition;
    this.scrollToMachine = scrollToMachine;
  }
}
