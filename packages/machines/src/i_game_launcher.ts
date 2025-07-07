import { IDisposable } from '@cgs/syd';
import { LobbyFacade } from './lobby_facade';
import { MachinePreloader } from './machine_preloader';
import { ISlotGame } from './reels_engine/i_slot_game';

export const T_IGameLauncher = Symbol('IGameLauncher');
export interface IGameLauncher extends IDisposable {
  isGameCodeExist(machineId: string): boolean;
  initLauncher(lobbyFacade: LobbyFacade): void;

  initPreloader(): Promise<MachinePreloader>;
  initGameView(): Promise<ISlotGame>;
}
