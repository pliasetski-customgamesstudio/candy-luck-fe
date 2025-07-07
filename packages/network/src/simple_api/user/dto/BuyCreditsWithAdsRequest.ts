import { SimpleBaseRequest, SimpleBaseRequestData } from '../../common/dto/dto';

export interface BuyCreditsWithAdsRequestDataParams {
  count: number;
  token: string;
}

type BuyCreditsRequestData = BuyCreditsWithAdsRequestDataParams & SimpleBaseRequestData;

export class BuyCreditsWithAdsRequest extends SimpleBaseRequest implements BuyCreditsRequestData {
  public static fromJson(json: BuyCreditsRequestData): BuyCreditsWithAdsRequest {
    return new BuyCreditsWithAdsRequest({
      session: json.session,
      userId: json.userId,
      externalUserId: json.externalUserId || null,
      count: json.count,
      token: json.token,
    });
  }

  public readonly count: number;
  public readonly token: string;

  constructor({ count, token, ...rest }: BuyCreditsRequestData) {
    super(rest);
    this.count = count;
    this.token = token;
  }

  public toJson(): BuyCreditsRequestData {
    return {
      count: this.count,
      token: this.token,
      ...super.toJson(),
    };
  }
}
