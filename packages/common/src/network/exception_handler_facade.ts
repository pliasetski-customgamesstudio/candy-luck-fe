import {
  HttpNetworkException,
  HttpTimeoutException,
  IExceptionHandlerFacade,
  ParseException,
  RetryingParams,
  ServerException,
  ServiceAddress,
} from '@cgs/network';
import { Func0, Func2, IAlertManager, IocContainer, Lazy, T_AlertManager } from '@cgs/shared';
import { IAuthorizationHolder } from '../services/authorization/i_authorization_holder';
import { ISessionHolder } from '../services/authorization/i_session_holder';
import { IAuthorizationService } from '../services/authorization/i_authorization_service';
import { IServerAnalyticsProcessor } from '../server_analytics/server_analytics_processor';
import { Completer, EventDispatcher, EventStream, StopWatch } from '@cgs/syd';
import { KnownServerErrorProvider } from './known_server_error_provider';
import { T_IAuthorizationService } from '../utils/type_definitions';
import { NoInternetException } from './exceptions/no_internet_exception';
import { SessionExpiredException } from './exceptions/session_expired_exception';

export interface IErrorPopup {
  show(message: string): Promise<boolean>;
}

export class ExceptionHandlerFacade implements IExceptionHandlerFacade {
  private _knownServerErrors: Map<string, any>;
  private _container: IocContainer;
  private _authorizationHolder: IAuthorizationHolder;
  private _sessionHolder: ISessionHolder;
  private _authorizationService: Lazy<IAuthorizationService>;
  private _serverAnalyticsProcessor: IServerAnalyticsProcessor | null = null;
  // private _batchRequestsProvider: Lazy<IBatchRequestsProvider>;
  private _noInternetDispatcher: EventDispatcher<void>;
  public noInternetStream: EventStream<void>;
  private _alertManager: IAlertManager | null;

  constructor(
    knownServerErrorsProvider: KnownServerErrorProvider,
    container: IocContainer,
    authorizationHolder: IAuthorizationHolder,
    sessionHolder: ISessionHolder,
    _serverAnalyticsProcessor: IServerAnalyticsProcessor | null = null
  ) {
    this._knownServerErrors = knownServerErrorsProvider.Errors;
    this._container = container;
    this._authorizationHolder = authorizationHolder;
    this._sessionHolder = sessionHolder;
    this._authorizationService = new Lazy<IAuthorizationService>(
      () => this._container.resolve<IAuthorizationService>(T_IAuthorizationService)!
    );
    this._alertManager = this._container.resolve<IAlertManager>(T_AlertManager);
    // this._batchRequestsProvider = new Lazy<IBatchRequestsProvider>(
    //   () => this._container.resolve<IBatchRequestsProvider>(T_IBatchRequestsProvider)!
    // );
    this._noInternetDispatcher = new EventDispatcher();
    this.noInternetStream = this._noInternetDispatcher.eventStream;
  }

  public async logFailedRequest<TResponse>(
    taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse | void>>,
    retrying: RetryingParams,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    const stopwatch = new StopWatch();
    stopwatch.start();
    try {
      return await taskFactory(retrying, addr);
    } catch (error) {
      if (error instanceof NoInternetException) {
        stopwatch.stop();
        throw error;
      }
      throw error;
    }
  }

  public async logNoInternet<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    const stopwatch = new StopWatch();
    stopwatch.start();
    try {
      return await taskFactory(request, addr);
    } catch (error) {
      if (error instanceof NoInternetException || error instanceof ServerException) {
        stopwatch.stop();
      }
      throw error;
    }
  }

  public async logRequestTime<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    const sw = new StopWatch();
    sw.start();
    try {
      return await taskFactory(request, addr);
    } finally {
      sw.stop();
      this._serverAnalyticsProcessor?.processRequest(addr, sw.elapsedMilliseconds);
    }
  }

  public async logServerError<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    const stopwatch = new StopWatch();
    stopwatch.start();
    try {
      return await taskFactory(request, addr);
    } catch (e) {
      if (e instanceof ServerException) {
        stopwatch.stop();
      }
      throw e;
    }
  }

  public async noInternet<T>(taskFactory: Func0<Promise<T>>): Promise<T | void> {
    try {
      return await taskFactory();
    } catch (e) {
      if (e instanceof HttpNetworkException || e instanceof HttpTimeoutException) {
        this._noInternetDispatcher.dispatchEvent();
        throw new NoInternetException(e);
      } else {
        throw e;
      }
    }
  }

  public async relaunchGameWhenError<TResponse>(
    taskFactory: Func0<Promise<TResponse>>
  ): Promise<TResponse | void> {
    return await taskFactory();
  }

  public async restartOnPermissionFailure(taskFactory: Func0<Promise<void>>): Promise<void> {
    return await taskFactory();
  }

  public async retryWhenNoInternet<TResponse>(
    taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse | void>>,
    retrying: RetryingParams,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    let triesRemaining: number = retrying.noInternetRemaining;
    let exception: NoInternetException;
    do {
      try {
        return await taskFactory(retrying, addr);
      } catch (ex) {
        if (ex instanceof NoInternetException) {
          triesRemaining--;
          exception = ex;
        } else {
          throw ex;
        }
      }
    } while (triesRemaining > 0);
    throw exception;
  }

  public async retryWhenServerError<TResponse>(
    taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse | void>>,
    retrying: RetryingParams,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    let triesRemaining: number = retrying.serverErrorRemaining;
    let exception: ServerException | ParseException;
    do {
      try {
        return await taskFactory(retrying, addr);
      } catch (ex) {
        if (ex instanceof ServerException || ex instanceof ParseException) {
          triesRemaining--;
          exception = ex;
        } else {
          throw ex;
        }
      }
    } while (triesRemaining > 0);
    throw exception;
  }

  public async serverError<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void> {
    try {
      return await taskFactory(request, addr)!;
    } catch (e) {
      if (e instanceof ServerException) {
        const errorMessage = e.message;

        const hasKey = [...this._knownServerErrors.entries()].find(([key]) =>
          errorMessage.includes(key)
        );

        if (hasKey) {
          const exType = hasKey[1];
          throw new exType(e);
        }
      }
      throw e;
    }
  }

  // public async sessionExpired<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
  //   request: TRequest,
  //   addr: ServiceAddress
  // ): Promise<TResponse | void> {
  //   return this.tripleSessionExpired(taskFactory, request, addr);
  // }

  // public async handleSinglePlaying<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
  //   request: TRequest,
  //   addr: ServiceAddress,
  //   service: symbol
  // ): Promise<TResponse | void> {
  //   let exception: NotActiveSessionException | null = null;
  //   let authorizationCounter = SimpleBaseApiService.authorizationCounter;
  //
  //   if (service !== T_AuthorizationApiService) {
  //     // await this._authorizationService.call().authSemaphore.acquire();
  //     authorizationCounter = SimpleBaseApiService.authorizationCounter;
  //     if (f_isIBaseRequest(request)) {
  //       request.session = this._sessionHolder.sessionToken;
  //     }
  //     // this._authorizationService.call().authSemaphore.release();
  //   }
  //
  //   try {
  //     const resp = await taskFactory(request, addr);
  //     return resp;
  //   } catch (e) {
  //     if (e instanceof NotActiveSessionException) {
  //       exception = e;
  //     }
  //   }
  //
  //   if (exception !== null) {
  //     if (authorizationCounter !== SimpleBaseApiService.authorizationCounter) {
  //       return await this.handleSinglePlaying(taskFactory, request, addr, service);
  //     }
  //
  //     return await this.handleSinglePlaying(taskFactory, request, addr, service);
  //   }
  //
  //   return Promise.resolve();
  // }

  // private async tripleSessionExpired<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
  //   request: TRequest,
  //   addr: ServiceAddress
  // ): Promise<TResponse | void> {
  //   return new FuncEx2<TRequest, ServiceAddress, Promise<TResponse | void>>((p, a) =>
  //     taskFactory(request, addr)
  //   )
  //     .wrap(this.handleSessionExpired)
  //     .wrap((f, r, a) =>
  //       this.doIfThrow(f, r, a, () => new Promise((resolve) => setTimeout(resolve, 1000)))
  //     )
  //     .wrap(this.handleSessionExpired)
  //     .wrap((f, r, a) =>
  //       this.doIfThrow(f, r, a, () => new Promise((resolve) => setTimeout(resolve, 3000)))
  //     )
  //     .wrap(this.handleSessionExpired)
  //     .apply(request, addr)
  //     .call();
  // }

  private async doIfThrow<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
    request: TRequest,
    addr: ServiceAddress,
    func: Func0<Promise<TResponse | void>>
  ): Promise<TResponse | void> {
    let ex: SessionExpiredException | null = null;

    try {
      return await taskFactory(request, addr);
    } catch (e) {
      if (e instanceof SessionExpiredException) {
        ex = e;
      }
    }

    if (ex) {
      await func();
    }
    throw ex;
  }

  private _reathorizeCompleter: Completer<string> | null = null;

  // private async handleSessionExpired<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse>>,
  //   request: TRequest,
  //   addr: ServiceAddress
  // ): Promise<TResponse> {
  //   let exception: SessionExpiredException | null = null;
  //
  //   let session = null;
  //   if (f_isIBaseRequest(request)) {
  //     session = request.session;
  //   }
  //
  //   try {
  //     const resp = await taskFactory(request, addr);
  //     return resp;
  //   } catch (e) {
  //     if (e instanceof SessionExpiredException) {
  //       exception = e;
  //     }
  //   }
  //
  //   if (exception !== null) {
  //     if (this._sessionHolder.sessionToken !== session && f_isIBaseRequest(request)) {
  //       request.session = this._sessionHolder.sessionToken;
  //       return await this.handleSessionExpired(taskFactory, request, addr);
  //     }
  //     const authorizationKey = this._authorizationHolder.getAuthorizationKey();
  //
  //     if (authorizationKey !== null) {
  //       try {
  //         if (!this._reathorizeCompleter) {
  //           try {
  //             this._reathorizeCompleter = new Completer<string>();
  //             // const authorization = await this._authorizationService
  //             //   .call()
  //             //   .authorizeByKey(authorizationKey.authorizationKey);
  //             this._reathorizeCompleter.complete(authorizationKey.authorizationKey);
  //           } finally {
  //             this._reathorizeCompleter = null;
  //           }
  //         } else {
  //           await this._reathorizeCompleter.promise;
  //         }
  //         if (f_isIBaseRequest(request)) {
  //           request.session = this._sessionHolder.sessionToken;
  //         }
  //         return await this.handleSessionExpired(taskFactory, request, addr);
  //       } catch (e) {
  //         if (e instanceof AuthorizationKeyNotFoundException) {
  //           this._authorizationHolder.removeAuthorizationKey();
  //           throw e;
  //         }
  //       }
  //     } else {
  //       throw new AuthorizationKeyNotFoundException(exception.innerException);
  //     }
  //   }
  //   throw exception;
  // }

  public async showToastWhenNoInternet<TResponse>(
    taskFactory: Func0<Promise<TResponse>>
  ): Promise<TResponse> {
    try {
      return await taskFactory();
    } catch (error) {
      if (error instanceof NoInternetException) {
        this._alertManager?.showConnectionError();
      }

      throw error;
    }
  }

  public async showToastWhenServerError<TResponse>(
    taskFactory: Func0<Promise<TResponse>>,
    _except?: string[]
  ): Promise<TResponse> {
    try {
      return await taskFactory();
    } catch (error) {
      if (error instanceof ServerException || error instanceof ParseException) {
        this._alertManager?.showUnhandled();
      }

      throw error;
    }
  }

  // public async tryGetBatchedResponse<TResponse>(
  //   taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse>>,
  //   retrying: RetryingParams,
  //   addr: ServiceAddress,
  //   responseType: symbol
  // ): Promise<TResponse> {
  //   const responseFound = new Out<boolean>();
  //   const response = await this._batchRequestsProvider
  //     .call()
  //     .tryGetDtoResponse<TResponse>(responseType, addr, responseFound);
  //
  //   if (!responseFound.value) {
  //     return await taskFactory(retrying, addr);
  //   }
  //
  //   return response;
  // }
}
