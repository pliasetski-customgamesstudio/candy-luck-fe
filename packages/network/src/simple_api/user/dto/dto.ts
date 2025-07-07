import { IDtoObject } from '../../../simple_api_request_service';

interface SimpleUser {
  balance: number;
  cheatUser: boolean;
  userId: string | null;
  progress: number;
  adsResetTime: number | null;
  gameNumber?: string;
}

export class SimpleDetailedUserInfoDTO implements IDtoObject {
  user: SimpleUserDTO;

  constructor(user: SimpleUserDTO) {
    this.user = user;
  }

  static fromJson(json: Record<string, any>): SimpleDetailedUserInfoDTO {
    return new SimpleDetailedUserInfoDTO(SimpleUserDTO.fromJson(json['user']));
  }

  toJson(): Record<string, any> {
    return {
      user: this.user.toJson(),
    };
  }
}

export class SimpleUserDTO implements IDtoObject, SimpleUser {
  balance: number;
  cheatUser: boolean;
  userId: string | null;
  progress: number;
  adsResetTime: number | null;
  gameNumber?: string;

  constructor({ balance, cheatUser, userId, gameNumber, progress, adsResetTime }: SimpleUser) {
    this.balance = balance;
    this.cheatUser = cheatUser;
    this.userId = userId;
    this.gameNumber = gameNumber;
    this.progress = progress;
    this.adsResetTime = adsResetTime;
  }

  static fromJson(json: Record<string, any>): SimpleUserDTO {
    return new SimpleUserDTO({
      balance: json['balance'],
      cheatUser: json['cheatUser'],
      userId: json['userId'],
      gameNumber: json['gameNumber'],
      progress: json['progress'],
      adsResetTime: json['adsResetTime'] || null,
    });
  }

  public toJson(): Record<string, any> {
    return {
      balance: this.balance,
      cheatUser: this.cheatUser,
      userId: this.userId,
      gameNumber: this.gameNumber,
      adsResetTime: this.adsResetTime,
    };
  }

  public clone(): SimpleUserDTO {
    return SimpleUserDTO.fromJson(this.toJson());
  }
}
