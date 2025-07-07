import {
  BuyCreditsWithGemsRequestDataParams,
  BuyCreditsWithAdsRequestDataParams,
  WatchAdsRequestDataParams,
  SimpleDetailedUserInfoDTO,
  WatchAdsResponse,
  GetTaskCompletedCreditsWithAdsRequestDataParams,
} from '@cgs/network';

export interface ISimpleLobbyService {
  getUserInfo(): Promise<SimpleDetailedUserInfoDTO>;
  refreshUserInfo(): Promise<SimpleDetailedUserInfoDTO>;
  buyCreditsWithGems(
    params: BuyCreditsWithGemsRequestDataParams
  ): Promise<SimpleDetailedUserInfoDTO>;
  buyCreditsWithAds(params: BuyCreditsWithAdsRequestDataParams): Promise<SimpleDetailedUserInfoDTO>;
  watchAds(params: WatchAdsRequestDataParams): Promise<WatchAdsResponse>;
  getTaskCompletedCreditsWithAds(
    params: GetTaskCompletedCreditsWithAdsRequestDataParams
  ): Promise<SimpleDetailedUserInfoDTO>;
}
