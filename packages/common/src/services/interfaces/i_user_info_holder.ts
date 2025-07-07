import { SimpleDetailedUserInfoDTO, SimpleUserDTO } from '@cgs/network';
import { IRefreshSupport } from './i_refresh_support';

export abstract class IUserInfoHolder implements IRefreshSupport {
  abstract lastRefresh: Date;
  abstract resetData(): void;
  // updateUserInfoSafe(
  //   user: UserDTO,
  //   curLevelConfig: LevelConfigDTO | null = null,
  //   nextLevelConfig: LevelConfigDTO | null = null
  // ): Promise<void>;
  user: SimpleUserDTO;
  // curLevelConfig: LevelConfigDTO;
  // nextLevelConfig: LevelConfigDTO;
  // sessionStoredProperties: Map<string, string>;
  // userChanged: Stream;
  // userSwitched: Stream;
  abstract updateUserInfo(detailedUserInfo: SimpleDetailedUserInfoDTO): Promise<void>;
  // setBonusGift(gameBonusGift: GameBonusGift): void;
  // getGameBonusGift(): GameBonusGift;
  // setEpicWinGift(gameEpicWinGift: GameBonusGift): void;
  // getEpicWinGift(): GameBonusGift;
}
