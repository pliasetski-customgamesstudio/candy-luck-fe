export interface WatchAdsResponseDataParams {
  token: string;
}

export class WatchAdsResponse implements WatchAdsResponseDataParams {
  token: string;

  constructor({ token }: WatchAdsResponseDataParams) {
    this.token = token;
  }

  static fromJson(json: WatchAdsResponseDataParams): WatchAdsResponse {
    return new WatchAdsResponse({
      token: json.token,
    });
  }

  public toJson(): WatchAdsResponseDataParams {
    return {
      token: this.token,
    };
  }
}
