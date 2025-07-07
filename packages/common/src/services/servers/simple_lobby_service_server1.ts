import { FuncEx0 } from '@cgs/shared';
import { IAuthorizationHolder } from '../authorization/i_authorization_holder';
import {
  SimpleBaseRequest,
  SimpleDetailedUserInfoDTO,
  SimpleUserApiService,
  BuyCreditsWithGemsRequest,
  BuyCreditsWithGemsRequestDataParams,
  BuyCreditsWithAdsRequest,
  BuyCreditsWithAdsRequestDataParams,
  WatchAdsRequest,
  WatchAdsRequestDataParams,
  WatchAdsResponse,
  GetTaskCompletedCreditsWithAdsRequest,
} from '@cgs/network';
import { ISimpleLobbyService } from '../i_simple_lobby_service';
import { GetTaskCompletedCreditsWithAdsRequestDataParams } from '@cgs/network';

export class SimpleLobbyServiceServer1 implements ISimpleLobbyService {
  private _sessionHolder: IAuthorizationHolder;
  private _userApiService: SimpleUserApiService;

  constructor(userApiService: SimpleUserApiService, sessionHolder: IAuthorizationHolder) {
    this._userApiService = userApiService;
    this._sessionHolder = sessionHolder;
  }

  async getUserInfo(): Promise<SimpleDetailedUserInfoDTO> {
    const request = new SimpleBaseRequest({
      session: this._sessionHolder.session,
      userId: this._sessionHolder.userId,
      externalUserId: this._sessionHolder.externalUserId,
    });
    return (await new FuncEx0(() =>
      this._userApiService.getUserInfo(request)
    ).call()) as SimpleDetailedUserInfoDTO;
  }

  async refreshUserInfo(): Promise<SimpleDetailedUserInfoDTO> {
    const request = new SimpleBaseRequest({
      session: this._sessionHolder.session,
      userId: this._sessionHolder.userId,
      externalUserId: this._sessionHolder.externalUserId,
    });
    return (await new FuncEx0(() =>
      this._userApiService.refreshUserInfo(request)
    ).call()) as SimpleDetailedUserInfoDTO;
  }

  async buyCreditsWithGems(
    params: BuyCreditsWithGemsRequestDataParams
  ): Promise<SimpleDetailedUserInfoDTO> {
    const request = new BuyCreditsWithGemsRequest({
      session: this._sessionHolder.session,
      userId: this._sessionHolder.userId,
      externalUserId: this._sessionHolder.externalUserId,
      ...params,
    });
    return (await new FuncEx0(() =>
      this._userApiService.buyCreditsWithGems(request)
    ).call()) as SimpleDetailedUserInfoDTO;
  }

  async buyCreditsWithAds(
    params: BuyCreditsWithAdsRequestDataParams
  ): Promise<SimpleDetailedUserInfoDTO> {
    const request = new BuyCreditsWithAdsRequest({
      session: this._sessionHolder.session,
      userId: this._sessionHolder.userId,
      externalUserId: this._sessionHolder.externalUserId,
      ...params,
    });
    return (await new FuncEx0(() =>
      this._userApiService.buyCreditsWithAds(request)
    ).call()) as SimpleDetailedUserInfoDTO;
  }

  async watchAds(params: WatchAdsRequestDataParams): Promise<WatchAdsResponse> {
    const request = new WatchAdsRequest({
      session: this._sessionHolder.session,
      userId: this._sessionHolder.userId,
      externalUserId: this._sessionHolder.externalUserId,
      ...params,
    });
    return (await new FuncEx0(() =>
      this._userApiService.watchAds(request)
    ).call()) as WatchAdsResponse;
  }

  async getTaskCompletedCreditsWithAds(
    params: GetTaskCompletedCreditsWithAdsRequestDataParams
  ): Promise<SimpleDetailedUserInfoDTO> {
    const request = new GetTaskCompletedCreditsWithAdsRequest({
      session: this._sessionHolder.session,
      userId: this._sessionHolder.userId,
      externalUserId: this._sessionHolder.externalUserId,
      ...params,
    });
    return (await new FuncEx0(() =>
      this._userApiService.getTaskCompletedCreditsWithAds(request)
    ).call()) as SimpleDetailedUserInfoDTO;
  }
}
