// import { Logger } from "@cgs/shared";
// import { IBalanceRefreshService } from "./interfaces/i_balance_refresh_service";
// import { IBalanceUpdater } from "./interfaces/i_balance_updater";
// import { ILobbyService } from "./interfaces/i_lobby_service";
// import { IUserInfoHolder } from "./interfaces/i_user_info_holder";

// class BalanceRefreshService implements IBalanceRefreshService {
//   private _userInfoHolder: IUserInfoHolder;
//   private _lobbyService: ILobbyService;
//   private _balanceUpdater: IBalanceUpdater;

//   constructor(
//     userInfoHolder: IUserInfoHolder,
//     lobbyService: ILobbyService,
//     balanceUpdater: IBalanceUpdater
//   ) {
//     this._userInfoHolder = userInfoHolder;
//     this._lobbyService = lobbyService;
//     this._balanceUpdater = balanceUpdater;
//   }

//   async refreshBalance(): Promise<void> {
//     const res = await this._lobbyService.getUserInfo();
//     if (!res) {
//       Logger.Error('GetUserinfo returned null');
//     }
//     await this._userInfoHolder.updateUserInfo(res);
//     this._balanceUpdater.resumeUpdate(false);
//   }
// }
