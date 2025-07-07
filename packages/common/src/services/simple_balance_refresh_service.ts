import { IBalanceRefreshService } from './interfaces/i_balance_refresh_service';
import { ISimpleUserInfoHolder } from './simple_user_info_holder';
import { ISimpleLobbyService } from './i_simple_lobby_service';
import { IBalanceUpdater } from './interfaces/i_balance_updater';
import { Logger } from '@cgs/shared';
import { IAuthorizationHolder } from './authorization/i_authorization_holder';

export class SimpleBalanceRefreshService implements IBalanceRefreshService {
  private _authorizationHolder: IAuthorizationHolder;
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _lobbyService: ISimpleLobbyService;
  private _balanceUpdater: IBalanceUpdater;

  constructor(
    authorizationHolder: IAuthorizationHolder,
    userInfoHolder: ISimpleUserInfoHolder,
    lobbyService: ISimpleLobbyService,
    balanceUpdater: IBalanceUpdater
  ) {
    this._authorizationHolder = authorizationHolder;
    this._userInfoHolder = userInfoHolder;
    this._lobbyService = lobbyService;
    this._balanceUpdater = balanceUpdater;
  }

  async refreshBalance(): Promise<void> {
    const res = await this._lobbyService.getUserInfo();
    if (!res) {
      Logger.Error('GetUserinfo returned null');
    }

    this._authorizationHolder.userId = res.user.userId;
    await this._userInfoHolder.updateUserInfo(res);
    this._balanceUpdater.resumeUpdate(false);
  }
}
