// import { Lazy, DateTimeConstants } from "@cgs/shared";
// import { EventDispatcher } from "@cgs/syd";
// import { GameBonusGift } from "./game_bonus_gift";
// import { IUserSafeUpdateListener } from "./i_user_safe_update_listener";
// import { IUserUpdateWatcher } from "./i_user_update_watcher";
// import { ILobbyService } from "./interfaces/i_lobby_service";
// import { IUserInfoHolder } from "./interfaces/i_user_info_holder";

// export class UserInfoHolder implements IUserInfoHolder, IUserUpdateWatcher {
//   private static _userId: string;
//   public static get userId(): string {
//     return UserInfoHolder._userId;
//   }

//   private _userSwitchedDispatcher: EventDispatcher = new EventDispatcher();
//   private _userChangedDispatcher: EventDispatcher = new EventDispatcher();
//   private _user: UserDTO;
//   private _curLevelConfig: LevelConfigDTO;
//   private _nextLevelConfig: LevelConfigDTO;
//   private _sessionStoredProperties: Record<string, string> = {};

//   private _lobbyService: Lazy<ILobbyService>;
//   private _lastRefresh: DateTime;
//   private _gameBonusGift: GameBonusGift;
//   private _gameEpicWinGift: GameBonusGift;
//   private _gameFreeSpinsGift: GameBonusGift;

//   private _listeners: IUserSafeUpdateListener[] = [];

//   constructor(lobbyService: ILobbyService) {
//     this._lobbyService = new Lazy<ILobbyService>(() => lobbyService);
//     this._lastRefresh = DateTimeConstants.MinValue;
//   }

//   public get userChanged(): Stream {
//     return this._userChangedDispatcher.eventStream;
//   }

//   public get userSwitched(): Stream {
//     return this._userSwitchedDispatcher.eventStream;
//   }

//   public get curLevelConfig(): LevelConfigDTO {
//     return this._curLevelConfig;
//   }

//   public get nextLevelConfig(): LevelConfigDTO {
//     return this._nextLevelConfig;
//   }

//   public get sessionStoredProperties(): Record<string, string> {
//     return this._sessionStoredProperties;
//   }

//   public get user(): UserDTO {
//     return this._user;
//   }

//   public async updateUserInfo(detailedUserInfo: DetailedUserInfoDTO): Promise<void> {
//     this._innerUpdateUserInfo(detailedUserInfo);
//     await this._notifyListeners();
//     this._onUserChanged();
//   }

//   private _innerUpdateUserInfo(detailedUserInfo: DetailedUserInfoDTO): void {
//     if (!detailedUserInfo || !detailedUserInfo.user) {
//       return;
//     }

//     let lastUser: UserDTO = null;
//     if (this._user) {
//       lastUser = this._user;
//     }

//     this._user = detailedUserInfo.user ?? this._user;
//     UserInfoHolder._userId = this._user ? this._user.userId : '';
//     this._curLevelConfig = detailedUserInfo.currentLevelConfig ?? this._curLevelConfig;
//     this._nextLevelConfig = detailedUserInfo.nextLevelConfig ?? this._nextLevelConfig;

//     if (detailedUserInfo.currentLevelConfig && detailedUserInfo.nextLevelConfig) {
//       this._lastRefresh = new DateTime.now();
//     }

//     if (
//       lastUser &&
//       detailedUserInfo.user &&
//       detailedUserInfo.user.userId != lastUser.userId
//     ) {
//       this._onUserSwitched();
//     }
//   }

//   private _updateUserInfo(
//     user: UserDTO,
//     curLevelConfig: LevelConfigDTO = null,
//     nextLevelConfig: LevelConfigDTO = null
//   ): void {
//     if (!user) {
//       return;
//     }

//     let lastUser: UserDTO = null;
//     if (this._user) {
//       lastUser = this._user;
//     }

//     this._user = user ?? this._user;
//     this._curLevelConfig = curLevelConfig ?? this._curLevelConfig;
//     this._nextLevelConfig = nextLevelConfig ?? this._nextLevelConfig;

//     if (curLevelConfig && nextLevelConfig) {
//       this._lastRefresh = new DateTime.now();
//     }
//     if (lastUser && user && user.userId != lastUser.userId) {
//       this._onUserSwitched();
//     }
//   }

//   public async updateUserInfoSafe(
//     user: UserDTO,
//     curLevelConfig: LevelConfigDTO = null,
//     nextLevelConfig: LevelConfigDTO = null
//   ): Promise<void> {
//     if (!user) {
//       return;
//     }

//     let levelsSynced: boolean = curLevelConfig && nextLevelConfig;
//     if (
//       !this._user ||
//       user.level === this._user.level ||
//       (curLevelConfig && nextLevelConfig)
//     ) {
//       this._updateUserInfo(user, curLevelConfig, nextLevelConfig);
//     } else {
//       levelsSynced = true;
//       let res = await this._lobbyService.call().getUserInfo();
//       this._innerUpdateUserInfo(res);
//     }

//     let needLevelSync: boolean = await this._notifyListeners();
//     if (needLevelSync && !levelsSynced) {
//       let res = await this._lobbyService.call().getUserInfo();
//       this._innerUpdateUserInfo(res);
//     }

//     this._onUserChanged();
//   }

//   public get lastRefresh(): DateTime {
//     return this._lastRefresh;
//   }

//   public resetData(): void {
//     this._lastRefresh = null;
//   }

//   public setBonusGift(gameBonusGift: GameBonusGift): void {
//     this._gameBonusGift = gameBonusGift;
//   }

//   public setEpicWinGift(gameEpicWinGift: GameBonusGift): void {
//     this._gameEpicWinGift = gameEpicWinGift;
//   }

//   public getEpicWinGift(): GameBonusGift {
//     let res = this._gameEpicWinGift;
//     this._gameEpicWinGift = null;
//     return res;
//   }

//   public getGameBonusGift(): GameBonusGift {
//     let res = this._gameBonusGift;
//     this._gameBonusGift = null;
//     return res;
//   }

//   private _onUserChanged(): void {
//     this._userChangedDispatcher.dispatchEvent();
//   }

//   private _onUserSwitched(): void {
//     this._userSwitchedDispatcher.dispatchEvent();
//   }

//   private _getListeners(): IUserSafeUpdateListener[] {
//     return this._listeners.slice();
//   }

//   private async _notifyListeners(): Promise<boolean> {
//     let needLevelSync: boolean = false;
//     for (let listener of this._getListeners()) {
//       needLevelSync = (await listener.afterUserChanged()) || needLevelSync;
//     }
//     return needLevelSync;
//   }

//   public registerListener(listener: IUserSafeUpdateListener): void {
//     this._listeners.push(listener);
//   }

//   public unregisterListener(listener: IUserSafeUpdateListener): void {
//     let index = this._listeners.indexOf(listener);
//     if (index !== -1) {
//       this._listeners.splice(index, 1);
//     }
//   }
// }
