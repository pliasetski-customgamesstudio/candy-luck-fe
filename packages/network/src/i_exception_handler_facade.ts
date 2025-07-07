import { Func0, Func2 } from '@cgs/shared';
import { EventStream } from '@cgs/syd';
import { ServiceAddress } from './service_address';
import { RetryingParams } from './retrying_params';

export interface IExceptionHandlerFacade {
  // handleSinglePlaying<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
  //   request: TRequest,
  //   addr: ServiceAddress
  // ): Promise<TResponse | void>;
  serverError<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  // sessionExpired<TRequest, TResponse>(
  //   taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
  //   request: TRequest,
  //   addr: ServiceAddress
  // ): Promise<TResponse | void>;
  logNoInternet<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  logServerError<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  logRequestTime<TRequest, TResponse>(
    taskFactory: Func2<TRequest, ServiceAddress, Promise<TResponse | void>>,
    request: TRequest,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  noInternet<TResponse>(taskFactory: Func0<Promise<TResponse | void>>): Promise<TResponse | void>;
  retryWhenNoInternet<TResponse>(
    taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse | void>>,
    retrying: RetryingParams,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  retryWhenServerError<TResponse>(
    taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse | void>>,
    retrying: RetryingParams,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  logFailedRequest<TResponse>(
    taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse | void>>,
    retrying: RetryingParams,
    addr: ServiceAddress
  ): Promise<TResponse | void>;
  showToastWhenServerError<TResponse>(
    taskFactory: Func0<Promise<TResponse | void>>,
    except?: string[]
  ): Promise<TResponse | void>;
  showToastWhenNoInternet<TResponse>(
    taskFactory: Func0<Promise<TResponse | void>>
  ): Promise<TResponse | void>;
  relaunchGameWhenError<TResponse>(
    taskFactory: Func0<Promise<TResponse | void>>
  ): Promise<TResponse | void>;
  restartOnPermissionFailure(taskFactory: Func0<Promise<void>>): Promise<void>;
  // tryGetBatchedResponse<TResponse>(taskFactory: Func2<RetryingParams, ServiceAddress, Promise<TResponse>>, retrying: RetryingParams, addr: ServiceAddress, responseType: Type): Promise<TResponse>;

  noInternetStream: EventStream<void>;
}
