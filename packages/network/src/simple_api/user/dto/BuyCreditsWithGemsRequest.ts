import { SimpleBaseRequest, SimpleBaseRequestData } from '../../common/dto/dto';

export interface BuyCreditsWithGemsRequestDataParams {
  count: number;
  gameKey: string;
  application: string;
  token: string;
}

type BuyCreditsRequestData = BuyCreditsWithGemsRequestDataParams & SimpleBaseRequestData;

export class BuyCreditsWithGemsRequest extends SimpleBaseRequest implements BuyCreditsRequestData {
  public static fromJson(json: BuyCreditsRequestData): BuyCreditsWithGemsRequest {
    return new BuyCreditsWithGemsRequest({
      session: json.session,
      userId: json.userId,
      externalUserId: json.externalUserId || null,
      count: json.count,
      gameKey: json.gameKey,
      application: json.application,
      token: json.token,
    });
  }

  public readonly count: number;
  public readonly gameKey: string;
  public readonly application: string;
  public readonly token: string;

  constructor({ count, gameKey, application, token, ...rest }: BuyCreditsRequestData) {
    super(rest);
    this.count = count;
    this.gameKey = gameKey;
    this.application = application;
    this.token = token;
  }

  public toJson(): BuyCreditsRequestData {
    return {
      count: this.count,
      gameKey: this.gameKey,
      application: this.application,
      token: this.token,
      ...super.toJson(),
    };
  }
}
