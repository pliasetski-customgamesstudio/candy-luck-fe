import { ICustomSlotGameFactory } from './i_custom_slot_game_factory';
import { GameCreator } from '../slot_game_factory';
import { LobbyFacade } from '../../../lobby_facade';

export class SlotGameFactoryWithSlotExtensions implements ICustomSlotGameFactory {
  registerGames(lobbyFacade: LobbyFacade): Map<string, GameCreator> {
    const games: Map<string, GameCreator> = new Map();

    return games;
  }
}
