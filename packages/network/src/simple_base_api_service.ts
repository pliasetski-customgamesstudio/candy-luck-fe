import { IExceptionHandlerFacade } from './i_exception_handler_facade';
import { IRequestSettings } from './i_request_settings';
import { IRequestNotifier } from './api/i_request_notifier';
import { IConnectionMonitor } from './i_connection_monitor';
import { IDtoObject, SimpleApiRequestService } from './simple_api_request_service';
import { HttpClient } from './http/http_client';
import { IRequestSynchronizer } from './request_synchronizer';
import { ServiceAddress } from './service_address';
import { Func1, Func2, FuncEx2, Duration } from '@cgs/shared';
import { RetryingParams } from './retrying_params';

export class SimpleBaseApiService {
  static authorizationCounter: number = 0;

  private _requestService: SimpleApiRequestService;
  private _exceptionHandlerFacade: IExceptionHandlerFacade;
  private _requestSettings: IRequestSettings;
  private _requestNotifier: IRequestNotifier;
  private _connectionMonitor: IConnectionMonitor;

  constructor(
    httpClient: HttpClient,
    exceptionHandlerFacade: IExceptionHandlerFacade,
    requestSettings: IRequestSettings,
    requestNotifier: IRequestNotifier,
    requestSynchronizer: IRequestSynchronizer,
    connectionMonitor: IConnectionMonitor
  ) {
    this._requestService = new SimpleApiRequestService(httpClient, requestSynchronizer);
    this._exceptionHandlerFacade = exceptionHandlerFacade;
    this._requestSettings = requestSettings;
    this._requestNotifier = requestNotifier;
    this._connectionMonitor = connectionMonitor;
  }

  protected get exceptionHandlerFacade(): IExceptionHandlerFacade {
    return this._exceptionHandlerFacade;
  }

  async doRequest<T>(
    address: ServiceAddress,
    requestDto: IDtoObject,
    factory: Func1<Record<string, any>, T>
  ): Promise<T> {
    const response = await new FuncEx2<IDtoObject, ServiceAddress, Promise<T | void>>((p, a) =>
      this._requestService.doRequest(a, requestDto, factory, this.timeOut(a))
    )
      .wrap(this._exceptionHandlerFacade.logRequestTime.bind(this._exceptionHandlerFacade))
      .wrap(this._exceptionHandlerFacade.serverError.bind(this._exceptionHandlerFacade))
      // .wrap(this._exceptionHandlerFacade.sessionExpired)
      // .wrap(this.singlePlayingHandler)
      .wrap(this.noInternet.bind(this))
      .wrap(this.retryWhenNoInternet.bind(this))
      .wrap(this.retryWhenServerError.bind(this))
      .wrap(this.showToastWhenNoInternet.bind(this))
      .wrap(this.showToastWhenServerError.bind(this))
      .wrap(this._exceptionHandlerFacade.logNoInternet)
      .wrap(this._exceptionHandlerFacade.logServerError)
      .apply(requestDto, address)
      .call();
    await this._requestNotifier.onRequest(this, address, requestDto, response);
    this._connectionMonitor.notifyRequestSucceed();
    return response!;
  }

  timeOut(address: ServiceAddress): Duration {
    return this._requestSettings.getRequestTimeout(address.serviceName, address.restPath);
  }

  noInternet<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse> {
    return this._exceptionHandlerFacade.noInternet<TResponse>(() =>
      taskFactory(request, addr)
    ) as Promise<TResponse>;
  }

  retryWhenNoInternet<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse> {
    return this._exceptionHandlerFacade.retryWhenNoInternet<TResponse>(
      () => taskFactory(request, addr),
      this.retryingParams(addr),
      addr
    ) as Promise<TResponse>;
  }

  showToastWhenNoInternet<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse> {
    return this._exceptionHandlerFacade.showToastWhenNoInternet<TResponse>(() =>
      taskFactory(request, addr)
    ) as Promise<TResponse>;
  }

  showToastWhenServerError<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse> {
    return this._exceptionHandlerFacade.showToastWhenServerError<TResponse>(() =>
      taskFactory(request, addr)
    ) as Promise<TResponse>;
  }

  retryWhenServerError<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse> {
    return this._exceptionHandlerFacade.retryWhenServerError<TResponse>(
      () => taskFactory(request, addr),
      this.retryingParams(addr),
      addr
    ) as Promise<TResponse>;
  }

  // async singlePlayingHandler<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
  //   request: TRequest,
  //   addr: ServiceAddress
  // ): Promise<TResponse | void> {
  //   return this._exceptionHandlerFacade.handleSinglePlaying<TRequest, TResponse>(
  //     (r, a) => taskFactory(r, a),
  //     request,
  //     addr
  //   ) as Promise<TResponse | void>;
  // }

  retryingParams(address: ServiceAddress): RetryingParams {
    return this._requestSettings.getRetryingParams(address.serviceName, address.restPath);
  }
}
