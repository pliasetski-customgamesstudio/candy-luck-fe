import { SimpleBaseRequest, SimpleBaseRequestData } from '../../common/dto/dto';

export interface WatchAdsRequestDataParams {
  count: number;
}

type BuyCreditsRequestData = WatchAdsRequestDataParams & SimpleBaseRequestData;

export class WatchAdsRequest extends SimpleBaseRequest implements BuyCreditsRequestData {
  public static fromJson(json: BuyCreditsRequestData): WatchAdsRequest {
    return new WatchAdsRequest({
      session: json.session,
      userId: json.userId,
      externalUserId: json.externalUserId || null,
      count: json.count,
    });
  }

  public readonly count: number;

  constructor({ count, ...rest }: BuyCreditsRequestData) {
    super(rest);
    this.count = count;
  }

  public toJson(): BuyCreditsRequestData {
    return {
      count: this.count,
      ...super.toJson(),
    };
  }
}
