import { ExtendedSpinsSlotGame } from './extended_spins_slot_game';
import { LobbyFacade } from '../../lobby_facade';
import { Platform } from '@cgs/syd';
import { ICoordinateSystemInfoProvider, ISplashManager, SceneCommon } from '@cgs/common';
import { ExtendedSlotGameParams } from './extended_slot_game_params';
import { ISlotExtension } from './i_slot_extension';
import { ISlotGameExtension } from './i_slot_game_extension';

export class SlotExtenstionSpinsSlotGame extends ExtendedSpinsSlotGame {
  static readonly DefaultRequiredProviders: Array<any> = [];
  static readonly DefaultComponents: Array<any> = [];

  constructor(
    lobbyFacade: LobbyFacade,
    platform: Platform,
    progress: ISplashManager,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    gameParams: ExtendedSlotGameParams,
    sceneCommon: SceneCommon,
    extensions: Array<ISlotExtension>,
    slotGameExtension: ISlotGameExtension
  ) {
    super(
      lobbyFacade,
      platform,
      progress,
      coordinateSystemInfoProvider,
      gameParams,
      sceneCommon,
      extensions,
      SlotExtenstionSpinsSlotGame.DefaultRequiredProviders,
      SlotExtenstionSpinsSlotGame.DefaultComponents
    );
    this.addSlotExtension(slotGameExtension);
  }
}
