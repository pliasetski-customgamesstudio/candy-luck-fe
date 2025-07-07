import {
  IAuthorizationHolder,
  ISimpleUserInfoHolder,
  ISimpleLobbyService,
  IBalanceUpdater,
} from '@cgs/common';
import { ArkadiumSdk, Logger } from '@cgs/shared';
import { ILoginOperationService } from './i_login_operation_service';
import { EventDispatcher, EventStream } from '@cgs/syd';
import { userIdSessionStorage } from '@cgs/common';

export const T_RefreshExternalUserService = Symbol('RefreshExternalUserService');

export class RefreshExternalUserService {
  private _authorizationHolder: IAuthorizationHolder;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _lobbyService: ISimpleLobbyService;
  private _loginOperationService: ILoginOperationService;
  private _balanceUpdater: IBalanceUpdater;
  private _isAuthorized: boolean = false;

  private _authorizedChanged: EventDispatcher<boolean> = new EventDispatcher<boolean>();
  private _userRefreshed: EventDispatcher<boolean> = new EventDispatcher<boolean>();

  constructor(
    authorizationHolder: IAuthorizationHolder,
    userInfoHolder: ISimpleUserInfoHolder,
    lobbyService: ISimpleLobbyService,
    loginOperationService: ILoginOperationService,
    balanceUpdater: IBalanceUpdater
  ) {
    this._authorizationHolder = authorizationHolder;
    this._userInfoHolder = userInfoHolder;
    this._lobbyService = lobbyService;
    this._loginOperationService = loginOperationService;
    this._balanceUpdater = balanceUpdater;
  }

  public async handleUserRefresh(): Promise<void> {
    const sdk = ArkadiumSdk.getInstance();

    this._isAuthorized = await sdk.isAuthorized();

    await sdk.onAuthStatusChange((isAuthorized) => {
      if (this._isAuthorized === isAuthorized) {
        return;
      }

      this._isAuthorized = isAuthorized;
      this._authorizedChanged.dispatchEvent(isAuthorized);
      isAuthorized ? this.refreshUser() : this.logOutUser();
    });
  }

  public get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  public get authorizedChanged(): EventStream<boolean> {
    return this._authorizedChanged.eventStream;
  }

  public get userRefreshed(): EventStream<boolean> {
    return this._userRefreshed.eventStream;
  }

  private async refreshUser(): Promise<void> {
    await this._loginOperationService.authorize();

    const res = await this._lobbyService.refreshUserInfo();
    if (!res) {
      Logger.Error('GetUserinfo returned null');
    }

    this._authorizationHolder.userId = res.user.userId;
    await this._userInfoHolder.updateUserInfo(res);
    this._balanceUpdater.resumeUpdate(false);
    this._userRefreshed.dispatchEvent();
  }

  private logOutUser(): void {
    userIdSessionStorage.clearUserId();
    location.reload();
  }
}
