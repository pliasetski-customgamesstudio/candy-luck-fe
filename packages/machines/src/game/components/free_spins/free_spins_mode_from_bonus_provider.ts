import { IFreeSpinsModeProvider } from './i_free_spins_mode_provider';
import { IStorageRepositoryProvider } from '../common_client_data_repository_provider';
import {
  T_BonusGameProvider,
  T_IGameStateMachineProvider,
  T_IStorageRepositoryProvider,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { BonusGameProvider } from '../mini_game/bonus_game_provider';
import { Container } from '@cgs/syd';

export class FreeSpinsModeFromBonusProvider implements IFreeSpinsModeProvider {
  private static readonly lastSelectedType: string = 'fsType';
  private _clientDataRepositoryProvider: IStorageRepositoryProvider;
  private _sceneId: string;
  private _freeSpinTypes: string[];

  constructor(container: Container, sceneId: string, freeSpinTypes: string[]) {
    this._sceneId = sceneId;
    this._freeSpinTypes = freeSpinTypes;
    this._clientDataRepositoryProvider = container.forceResolve(T_IStorageRepositoryProvider);
    container
      .forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
      .gameStateMachine.freeSpinsRecovery.entered.listen((_s: any) => this._onFreeSpinsRecovery());
    container
      .forceResolve<BonusGameProvider>(T_BonusGameProvider)
      .onMiniGameCreated.listen((bonusGame: any) => this._onBonusGameCreated(bonusGame));
  }

  private _onBonusGameCreated(bonusGame: any) {
    bonusGame.onBonusFinished.first.then((finishArgs: any) => this._onBonusFinished(finishArgs));
  }

  private _onBonusFinished(finishArgs: any) {
    const selectedType = finishArgs.lastSelectedType;
    if (this._freeSpinTypes.includes(selectedType)) {
      this.setMode(selectedType);
    }
  }

  private _onFreeSpinsRecovery() {
    this._currentMode = this._clientDataRepositoryProvider.readItem(
      FreeSpinsModeFromBonusProvider.lastSelectedType
    );
  }

  public get AllViews(): string[] | null {
    return null;
  }

  private _currentMode: string | null;
  public get currentMode(): string | null {
    return this._currentMode;
  }

  public get groupMarker(): string | null {
    return null;
  }

  public get modePickerId(): string {
    return this._sceneId;
  }

  public setMode(symbolId: string): void {
    this._currentMode = symbolId;
    this._clientDataRepositoryProvider.createItem(
      FreeSpinsModeFromBonusProvider.lastSelectedType,
      symbolId
    );
  }
}
