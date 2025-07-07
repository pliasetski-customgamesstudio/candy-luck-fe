import { IAppSettings, ISimpleUserInfoHolder } from '@cgs/common';
import { IBonusSharer } from './i_bonus_sharer';

export class BonusSharer implements IBonusSharer {
  private _userInfoHolder: ISimpleUserInfoHolder;
  private _appSettings: IAppSettings;

  private _sharedTokens: Set<string> = new Set<string>();

  get enabled(): boolean {
    return false;
  }

  constructor(userInfoHolder: ISimpleUserInfoHolder, appSettings: IAppSettings) {
    this._userInfoHolder = userInfoHolder;
    this._appSettings = appSettings;
  }

  shareBonus(): void {}

  shareEpicWin(): void {}

  shareFreeSpins(gameId: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
