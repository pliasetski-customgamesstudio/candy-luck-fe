import { SimpleBaseRequest, SimpleBaseRequestData } from '../../common/dto/dto';

export interface GetTaskCompletedCreditsWithAdsRequestDataParams {
  token: string;
}

type GetTaskCompletedCreditsWithAdsRequestData = GetTaskCompletedCreditsWithAdsRequestDataParams &
  SimpleBaseRequestData;

export class GetTaskCompletedCreditsWithAdsRequest
  extends SimpleBaseRequest
  implements GetTaskCompletedCreditsWithAdsRequestData
{
  public static fromJson(
    json: GetTaskCompletedCreditsWithAdsRequestData
  ): GetTaskCompletedCreditsWithAdsRequest {
    return new GetTaskCompletedCreditsWithAdsRequest({
      session: json.session,
      userId: json.userId,
      externalUserId: json.externalUserId || null,
      token: json.token,
    });
  }

  public readonly token: string;

  constructor({ token, ...rest }: GetTaskCompletedCreditsWithAdsRequestData) {
    super(rest);
    this.token = token;
  }

  public toJson(): GetTaskCompletedCreditsWithAdsRequestData {
    return {
      token: this.token,
      ...super.toJson(),
    };
  }
}
