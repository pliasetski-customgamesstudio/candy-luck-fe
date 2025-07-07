import { SimpleBaseApiService } from '../../simple_base_api_service';
import { HttpClient } from '../../http/http_client';
import { IRequestSettings } from '../../i_request_settings';
import { IRequestNotifier } from '../../api/i_request_notifier';
import { IRequestSynchronizer } from '../../request_synchronizer';
import { IConnectionMonitor } from '../../i_connection_monitor';
import { ServiceAddress } from '../../service_address';
import { SimpleBaseRequest } from '../common/dto/dto';
import { SimpleDetailedUserInfoDTO } from './dto/dto';
import { RetryingParams } from '../../retrying_params';
import { FuncEx2, EnvironmentConfig } from '@cgs/shared';
import { IExceptionHandlerFacade } from '../../i_exception_handler_facade';
import { BuyCreditsWithGemsRequest } from './dto/BuyCreditsWithGemsRequest';
import { BuyCreditsWithAdsRequest } from './dto/BuyCreditsWithAdsRequest';
import { WatchAdsRequest } from './dto/WatchAdsRequest';
import { WatchAdsResponse } from './dto/WatchAdsResponse';
import { GetTaskCompletedCreditsWithAdsRequest } from './dto/GetTaskCompletedCreditsWithAdsRequest';

export class SimpleUserApiService extends SimpleBaseApiService {
  static readonly HttpMethod: string = 'POST';
  static readonly ServiceName: string = 'user';

  constructor(
    httpClient: HttpClient,
    exceptionHandlerFacade: IExceptionHandlerFacade,
    requestSettings: IRequestSettings,
    requestNotifier: IRequestNotifier,
    requestSynchronizer: IRequestSynchronizer,
    connectionMonitor: IConnectionMonitor
  ) {
    super(
      httpClient,
      exceptionHandlerFacade,
      requestSettings,
      requestNotifier,
      requestSynchronizer,
      connectionMonitor
    );
  }

  private _getUserInfo = new ServiceAddress(
    EnvironmentConfig.url,
    SimpleUserApiService.ServiceName,
    EnvironmentConfig.userInfoMethodName,
    SimpleUserApiService.HttpMethod
  );

  public getUserInfo(request: SimpleBaseRequest): Promise<SimpleDetailedUserInfoDTO> {
    const address = this._getUserInfo;
    // const responseType = DetailedUserInfoDTO;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<SimpleDetailedUserInfoDTO | void>>(
      (p, a) =>
        this.doRequest<SimpleDetailedUserInfoDTO>(a, request, SimpleDetailedUserInfoDTO.fromJson)
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<SimpleDetailedUserInfoDTO>;
  }

  private _refreshUserInfo = new ServiceAddress(
    EnvironmentConfig.url,
    SimpleUserApiService.ServiceName,
    EnvironmentConfig.refreshUserInfoMethodName,
    SimpleUserApiService.HttpMethod
  );

  public refreshUserInfo(request: SimpleBaseRequest): Promise<SimpleDetailedUserInfoDTO> {
    const address = this._refreshUserInfo;

    return new FuncEx2<RetryingParams, ServiceAddress, Promise<SimpleDetailedUserInfoDTO | void>>(
      (p, a) =>
        this.doRequest<SimpleDetailedUserInfoDTO>(a, request, SimpleDetailedUserInfoDTO.fromJson)
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<SimpleDetailedUserInfoDTO>;
  }

  private _buyCreditsWithGems = new ServiceAddress(
    EnvironmentConfig.url,
    SimpleUserApiService.ServiceName,
    EnvironmentConfig.buyCreditsWithGemsMethodName,
    SimpleUserApiService.HttpMethod
  );

  public buyCreditsWithGems(
    request: BuyCreditsWithGemsRequest
  ): Promise<SimpleDetailedUserInfoDTO> {
    const address = this._buyCreditsWithGems;

    return (
      new FuncEx2<RetryingParams, ServiceAddress, Promise<SimpleDetailedUserInfoDTO | void>>(
        (p, a) =>
          this.doRequest<SimpleDetailedUserInfoDTO>(a, request, SimpleDetailedUserInfoDTO.fromJson)
      )
        // .wrap((taskFactory, retrying, addr) => this.exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
        .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
        .wrap(this.exceptionHandlerFacade.retryWhenServerError)
        .wrap(this.exceptionHandlerFacade.logFailedRequest)
        .apply(this.retryingParams(address), address)
        .call() as Promise<SimpleDetailedUserInfoDTO>
    );
  }

  private _buyCreditsWithAds = new ServiceAddress(
    EnvironmentConfig.url,
    SimpleUserApiService.ServiceName,
    EnvironmentConfig.buyCreditsWithAdsMethodName,
    SimpleUserApiService.HttpMethod
  );

  public buyCreditsWithAds(request: BuyCreditsWithAdsRequest): Promise<SimpleDetailedUserInfoDTO> {
    const address = this._buyCreditsWithAds;

    return (
      new FuncEx2<RetryingParams, ServiceAddress, Promise<SimpleDetailedUserInfoDTO | void>>(
        (p, a) =>
          this.doRequest<SimpleDetailedUserInfoDTO>(a, request, SimpleDetailedUserInfoDTO.fromJson)
      )
        // .wrap((taskFactory, retrying, addr) => this.exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
        .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
        .wrap(this.exceptionHandlerFacade.retryWhenServerError)
        .wrap(this.exceptionHandlerFacade.logFailedRequest)
        .apply(this.retryingParams(address), address)
        .call() as Promise<SimpleDetailedUserInfoDTO>
    );
  }

  private _watchAds = new ServiceAddress(
    EnvironmentConfig.url,
    SimpleUserApiService.ServiceName,
    EnvironmentConfig.watchAdsMethodName,
    SimpleUserApiService.HttpMethod
  );

  public watchAds(request: WatchAdsRequest): Promise<WatchAdsResponse> {
    const address = this._watchAds;

    return (
      new FuncEx2<RetryingParams, ServiceAddress, Promise<WatchAdsResponse | void>>((p, a) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.doRequest<WatchAdsResponse>(a, request, WatchAdsResponse.fromJson)
      )
        // .wrap((taskFactory, retrying, addr) => this.exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
        .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
        .wrap(this.exceptionHandlerFacade.retryWhenServerError)
        .wrap(this.exceptionHandlerFacade.logFailedRequest)
        .apply(this.retryingParams(address), address)
        .call() as Promise<WatchAdsResponse>
    );
  }

  private _getTaskCompletedCreditsWithAds = new ServiceAddress(
    EnvironmentConfig.url,
    SimpleUserApiService.ServiceName,
    EnvironmentConfig.getTaskCompletedCreditsWithAdsMethodName,
    SimpleUserApiService.HttpMethod
  );

  public getTaskCompletedCreditsWithAds(
    request: GetTaskCompletedCreditsWithAdsRequest
  ): Promise<SimpleDetailedUserInfoDTO> {
    const address = this._getTaskCompletedCreditsWithAds;

    return (
      new FuncEx2<RetryingParams, ServiceAddress, Promise<SimpleDetailedUserInfoDTO | void>>(
        (p, a) =>
          this.doRequest<SimpleDetailedUserInfoDTO>(a, request, SimpleDetailedUserInfoDTO.fromJson)
      )
        // .wrap((taskFactory, retrying, addr) => this.exceptionHandlerFacade.tryGetBatchedResponse(taskFactory, retrying, addr, responseType))
        .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
        .wrap(this.exceptionHandlerFacade.retryWhenServerError)
        .wrap(this.exceptionHandlerFacade.logFailedRequest)
        .apply(this.retryingParams(address), address)
        .call() as Promise<SimpleDetailedUserInfoDTO>
    );
  }
}
