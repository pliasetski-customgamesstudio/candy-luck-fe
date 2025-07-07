import {
  SceneFactory,
  ICoordinateSystemInfoProvider,
  ScaleManager,
  IClientProperties,
} from '@cgs/common';
import { IResourceCache, ResourcePackage } from '@cgs/syd';
import { GameIds } from './game/slot_game_factory/gameIds';
import { SlotGameFactory } from './game/slot_game_factory/slot_game_factory';
import { IGameLauncher } from './i_game_launcher';
import { LobbyFacade } from './lobby_facade';
import { MachinePreloader } from './machine_preloader';
import { ISlotGame } from './reels_engine/i_slot_game';
import { ApplicationGameConfig } from '@cgs/shared';

export class GameLauncher implements IGameLauncher {
  private _gameFactory: SlotGameFactory;
  private _preloader: MachinePreloader;
  private _sceneFactory: SceneFactory;
  private _resourceCache: IResourceCache;
  private _loadingPackage: ResourcePackage | null = null;
  private _coordinateSystemInfoProvider: ICoordinateSystemInfoProvider;
  private _scaleManager: ScaleManager;
  private _clientProperties: IClientProperties;

  constructor(
    sceneFactory: SceneFactory,
    resourceCache: IResourceCache,
    coordinateSystemInfoProvider: ICoordinateSystemInfoProvider,
    scaleManager: ScaleManager,
    clientProperties: IClientProperties
  ) {
    this._sceneFactory = sceneFactory;
    this._resourceCache = resourceCache;
    this._coordinateSystemInfoProvider = coordinateSystemInfoProvider;
    this._scaleManager = scaleManager;
    this._clientProperties = clientProperties;
  }

  public dispose(): void {
    if (this._loadingPackage) {
      this._resourceCache.unloadPackage(this._loadingPackage);
      this._loadingPackage = null;
    }
  }

  public async initGameView(): Promise<ISlotGame> {
    const game = this._gameFactory.createGame(this._preloader);
    game.initialize();

    try {
      const res = await game.slotLoaded;
      if (!res) {
        game.dispose();
      }
      return res;
    } catch (e) {
      game.dispose();
      throw e;
    }
  }

  public initLauncher(lobbyFacade: LobbyFacade): void {
    this._gameFactory = new SlotGameFactory(lobbyFacade, this._clientProperties);
  }

  public async initPreloader(): Promise<MachinePreloader> {
    const packUrl = `games/${ApplicationGameConfig.gameId}/loading.zip`;
    this._loadingPackage = await this._resourceCache.loadPackage(packUrl);
    this._preloader = new MachinePreloader(
      this._sceneFactory,
      this._coordinateSystemInfoProvider,
      this._scaleManager
    );

    this._preloader.initialize();
    await this._preloader.initializeScaler();
    return this._preloader;
  }

  public isGameCodeExist(machineId: string): boolean {
    return GameIds.isGameCodeExists(machineId);
  }
}
