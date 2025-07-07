import {
  ISettingsManager,
  ISettingsSection,
  ISimpleUserInfoHolder,
  SettingsExtensions,
  T_ISettingsManager,
  T_ISimpleUserInfoHolder,
} from '@cgs/common';
import { Container } from '@cgs/syd';
import { T_IGameParams } from '../../type_definitions';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';

export interface IStorageRepositoryProvider {
  createItem(key: string, value: string, isUpdateMode?: boolean): void;
  readItem(key: string): string | null;
  deleteItem(key: string): void;
}

export class CommonClientDataRepositoryProvider implements IStorageRepositoryProvider {
  private static readonly RepName: string = 'MF';
  private static readonly SearchPattern: string = 'USER_ID:KEY';
  private static readonly LongTimeForSaveCookie: number = 600000;

  private _withGameId: boolean;
  private _withUserId: boolean;
  private _container: Container;
  private _section: ISettingsSection;

  constructor(
    container: Container,
    { withUserId = true, withGameId = true }: { withUserId?: boolean; withGameId?: boolean }
  ) {
    const settingManager = container.forceResolve<ISettingsManager>(T_ISettingsManager);
    const settingStore = settingManager.getSettingsStore(
      CommonClientDataRepositoryProvider.RepName
    );
    this._section = SettingsExtensions.getOrAddSection(
      settingStore,
      CommonClientDataRepositoryProvider.RepName
    );
    this._container = container;
    this._withGameId = withGameId;
    this._withUserId = withUserId;
  }

  private get _userId(): string | null {
    return this._withUserId
      ? this._container.forceResolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder).user.userId
      : null;
  }

  private get _gameId(): string {
    return this._withGameId
      ? this._container.forceResolve<IGameParams>(T_IGameParams).machineId
      : '';
  }

  public createItem(key: string, value: string, isUpdateMode: boolean = true): void {
    this._validateKeyValue(key, value);
    if (this.readItem(key)) {
      if (isUpdateMode) {
        this.deleteItem(key);
      } else {
        throw new Error('such item is present');
      }
    }

    const fullKey = this._getFullKey(key);
    this._section.set(fullKey, value);
  }

  public readItem(key: string): string | null {
    const fullKey = this._getFullKey(key);
    return this._section.keyExists(fullKey) ? this._section.get(fullKey) : null;
  }

  public deleteItem(key: string): void {
    const fullKey = this._getFullKey(key);
    SettingsExtensions.deleteKeyIfExist(this._section, fullKey);
  }

  private _getFullKey(key: string): string {
    return CommonClientDataRepositoryProvider.SearchPattern.replace(
      'USER_ID',
      this._userId || ''
    ).replace('KEY', key);
  }

  private _validateKeyValue(key: string, value: string): void {
    if (!key) {
      throw new Error('key is null or empty');
    }

    if (!value) {
      throw new Error('value is null or empty');
    }
  }
}
