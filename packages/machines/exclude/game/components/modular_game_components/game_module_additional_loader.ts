import { Container } from 'inversify';
import { SceneCommon } from 'scene_common';
import { OptionalLoader } from 'optional_loader';
import { ISlotSessionProvider } from 'slot_session_provider';
import { ISlotGameModule } from 'slot_game_module';
import { StringUtils } from 'string_utils';

class GameModuleAdditionalLoader extends OptionalLoader {
  private _slotSession: SlotSession;
  private _gameModule: BaseSlotGameModule;
  private _resourcePackage: ResourcePackage;
  private _allowUnload: boolean;

  constructor(container: Container, sceneCommon: SceneCommon, allowUnload: boolean = true) {
    super(container, sceneCommon);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameModule = container.resolve(ISlotGameModule);
    this._allowUnload = allowUnload;
  }

  public async load(): Promise<void> {
    const resourceCache = this.sceneCommon.resourceCache;
    const packageName = `games/game${this._slotSession.GameId}/additional_m${StringUtils.format([
      this._gameModule.moduleParams.gameId,
    ])}.wad.xml`;
    const p = await resourceCache.loadPackage(packageName);
    this.isLoaded = true;
    this.loadedDispatcher.dispatchEvent(true);
    this._resourcePackage = p;
  }

  public dispose(): void {
    super.dispose();
    if (this._allowUnload) {
      this.sceneCommon.resourceCache.unloadPackage(this._resourcePackage);
    }
  }
}
