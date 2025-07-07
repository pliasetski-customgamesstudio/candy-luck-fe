import { LobbyFacade } from '../../../lobby_facade';
import { GameCreator } from '../slot_game_factory';

export interface ICustomSlotGameFactory {
  registerGames(lobbyFacade: LobbyFacade): Map<string, GameCreator>;
}
