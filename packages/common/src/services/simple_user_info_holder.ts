import { SimpleUserDTO, SimpleDetailedUserInfoDTO } from '@cgs/network';
import { EventStream, EventDispatcher } from '@cgs/syd';
import { IUserSafeUpdateListener } from './i_user_safe_update_listener';
import { IUserUpdateWatcher } from './i_user_update_watcher';
import { IRefreshSupport } from './interfaces/i_refresh_support';

export const T_ISimpleUserInfoHolder = Symbol('ISimpleUserInfoHolder');
export interface ISimpleUserInfoHolder extends IRefreshSupport {
  updateUserInfoSafe(user: SimpleUserDTO): Promise<void>;
  user: SimpleUserDTO;
  sessionStoredProperties: Map<string, string>;
  userChanged: EventStream<void>;
  userSwitched: EventStream<void>;
  updateUserInfo(detailedUserInfo: SimpleDetailedUserInfoDTO): Promise<void>;
}

export class SimpleUserInfoHolder implements ISimpleUserInfoHolder, IUserUpdateWatcher {
  private static _userId: string | null;
  static get userId(): string | null {
    return SimpleUserInfoHolder._userId;
  }

  private _userSwitchedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  private _userChangedDispatcher: EventDispatcher<void> = new EventDispatcher<void>();
  private _user: SimpleUserDTO;
  private _sessionStoredProperties: Map<string, string> = new Map();
  private _lastRefresh: Date;

  private _listeners: IUserSafeUpdateListener[] = [];

  constructor() {
    this._lastRefresh = new Date(Number.MIN_VALUE);
  }

  get userChanged(): EventStream<void> {
    return this._userChangedDispatcher.eventStream;
  }

  get userSwitched(): EventStream<void> {
    return this._userSwitchedDispatcher.eventStream;
  }

  get sessionStoredProperties(): Map<string, string> {
    return this._sessionStoredProperties;
  }

  get user(): SimpleUserDTO {
    return this._user;
  }

  async updateUserInfo(detailedUserInfo: SimpleDetailedUserInfoDTO): Promise<void> {
    this._innerUpdateUserInfo(detailedUserInfo);
    await this._notifyListeners();
    this._onUserChanged();
  }

  private _innerUpdateUserInfo(detailedUserInfo: SimpleDetailedUserInfoDTO): void {
    if (!detailedUserInfo?.user) {
      return;
    }

    let lastUser: SimpleUserDTO | null = null;
    if (this._user) {
      lastUser = this._user;
    }

    this._user = detailedUserInfo.user ?? this._user;
    SimpleUserInfoHolder._userId = this._user ? this._user.userId : null;

    this._lastRefresh = new Date();

    if (lastUser && detailedUserInfo.user && detailedUserInfo.user.userId !== lastUser.userId) {
      this._onUserSwitched();
    }
  }

  private _updateUserInfo(user: SimpleUserDTO): void {
    if (!user) {
      return;
    }

    let lastUser: SimpleUserDTO | null = null;
    if (this._user) {
      lastUser = this._user;
    }

    this._user = user ?? this._user;
    this._lastRefresh = new Date();
    if (lastUser && user && user.userId != lastUser.userId) {
      this._onUserSwitched();
    }
  }

  async updateUserInfoSafe(user: SimpleUserDTO): Promise<void> {
    this._updateUserInfo(user);

    this._onUserChanged();
  }

  get lastRefresh(): Date {
    return this._lastRefresh;
  }

  resetData(): void {
    this._lastRefresh = new Date(Number.MIN_VALUE);
  }

  private _onUserChanged(): void {
    this._userChangedDispatcher.dispatchEvent();
  }

  private _onUserSwitched(): void {
    this._userSwitchedDispatcher.dispatchEvent();
  }

  private _getListeners(): IUserSafeUpdateListener[] {
    return this._listeners.slice();
  }

  private async _notifyListeners(): Promise<boolean> {
    let needLevelSync: boolean = false;
    for (const listener of this._getListeners()) {
      needLevelSync = (await listener.afterUserChanged()) || needLevelSync;
    }
    return needLevelSync;
  }

  registerListener(listener: IUserSafeUpdateListener): void {
    this._listeners.push(listener);
  }

  unregisterListener(listener: IUserSafeUpdateListener): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
}
