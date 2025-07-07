import { SimpleBaseApiService } from '../../simple_base_api_service';
import { ServiceAddress } from '../../service_address';
import { IHttpClient } from '../../http/i_http_client';
import { IExceptionHandlerFacade } from '../../i_exception_handler_facade';
import { IRequestNotifier } from '../../api/i_request_notifier';
import { IRequestSettings } from '../../i_request_settings';
import { IRequestSynchronizer } from '../../request_synchronizer';
import { IConnectionMonitor } from '../../i_connection_monitor';
import { BonusPickRequest } from './dto/BonusPickRequest';
import { BonusInfoDTO } from './dto/BonusInfoDTO';
import { ModularSpinResultResponse } from './dto/ModularSpinResultResponse';
import { SpinRequest } from './dto/SpinRequest';
import { RetryingParams } from '../../retrying_params';
import { FuncEx2, EnvironmentConfig } from '@cgs/shared';
import { TStaticGamesInfoDTO } from './dto/TStaticGamesInfoDTO';
import { TStaticActionParams } from './dto/TStaticActionParams';
import { SpinResultResponse } from './dto/SpinResultResponse';
import { ModularMachineInfoDTO } from './dto/ModularMachineInfoDTO';
import { AdditionalDataTypesResponse } from './dto/AdditionalDataTypesResponse';
import { SimpleBaseRequest } from '../common/dto/dto';
import { MachineInfoDTO } from './dto/MachineInfoDTO';
import { ScatterPickRequest } from './dto/ScatterPickRequest';
import { IDtoObject } from '../../simple_api_request_service';
import { IResponseBuilder } from './i_slots_api_service';

export class SlotsApiService extends SimpleBaseApiService {
  private static readonly HttpMethod: string = 'POST';
  private static readonly ServiceName: string = 'slots';

  constructor(
    httpClient: IHttpClient,
    exceptionHandlerFacade: IExceptionHandlerFacade,
    requestSettings: IRequestSettings,
    requestNotifier: IRequestNotifier,
    requestSynchronizer: IRequestSynchronizer,
    connectionMonitor: IConnectionMonitor,
    private responseBuilder: IResponseBuilder
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

  public pickBonusAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    EnvironmentConfig.bonusMethodName,
    SlotsApiService.HttpMethod
  );

  public pickBonus(request: BonusPickRequest): Promise<BonusInfoDTO> {
    const address = this.pickBonusAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<BonusInfoDTO>>(
      (p, a) =>
        this.doRequest<BonusInfoDTO>(a, request, BonusInfoDTO.fromJson) as Promise<BonusInfoDTO>
    )
      .apply(this.retryingParams(address), address)
      .call() as Promise<BonusInfoDTO>;
  }

  private _modularSpinAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'modularSpin',
    SlotsApiService.HttpMethod
  );

  public modularSpin(request: SpinRequest): Promise<ModularSpinResultResponse> {
    const address = this._modularSpinAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<ModularSpinResultResponse>>(
      (p, a) =>
        this.doRequest<ModularSpinResultResponse>(
          a,
          request,
          ModularSpinResultResponse.fromJson
        ) as Promise<ModularSpinResultResponse>
    )
      .apply(this.retryingParams(address), address)
      .call()!;
  }

  private _tutorialSpinAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'tutorialSpin',
    SlotsApiService.HttpMethod
  );

  public tutorialSpin(request: SpinRequest): Promise<SpinResultResponse> {
    const address = this._tutorialSpinAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<SpinResultResponse | void>>((p, a) =>
      this.doRequest<SpinResultResponse>(a, request, (json) =>
        this.responseBuilder.buildSpinResultResponse(json)
      )
    )
      .apply(this.retryingParams(address), address)
      .call() as Promise<SpinResultResponse>;
  }

  private _extraBetSpinAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'extraBetSpin',
    SlotsApiService.HttpMethod
  );

  public extraBetSpin(request: SpinRequest): Promise<SpinResultResponse> {
    const address = this._extraBetSpinAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<SpinResultResponse | void>>((p, a) =>
      this.doRequest<SpinResultResponse>(a, request, (json) =>
        this.responseBuilder.buildSpinResultResponse(json)
      )
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<SpinResultResponse>;
  }

  private _startMachineAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    EnvironmentConfig.initMethodName,
    SlotsApiService.HttpMethod
  );

  public startMachine(request: IDtoObject): Promise<MachineInfoDTO> {
    /*return Promise.resolve(this.responseBuilder.buildMachineInfo(JSONS[0]));*/

    const address = this._startMachineAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<MachineInfoDTO | void>>(
      (p, a) =>
        this.doRequest<MachineInfoDTO>(a, request, (json) =>
          this.responseBuilder.buildMachineInfo(json)
        ) as Promise<MachineInfoDTO>
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<MachineInfoDTO>;
  }

  public pickScatterAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'scatter',
    SlotsApiService.HttpMethod
  );

  public pickScatter(request: ScatterPickRequest): Promise<BonusInfoDTO> {
    const address = this.pickScatterAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<BonusInfoDTO | void>>(
      (p, a) =>
        this.doRequest<BonusInfoDTO>(a, request, BonusInfoDTO.fromJson) as Promise<BonusInfoDTO>
    )
      .apply(this.retryingParams(address), address)
      .call() as Promise<BonusInfoDTO>;
  }

  private _getMachineInfoAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'getMachineInfo',
    SlotsApiService.HttpMethod
  );

  getMachineInfo(request: IDtoObject): Promise<MachineInfoDTO> {
    const address = this._getMachineInfoAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<MachineInfoDTO | void>>((p, a) =>
      this.doRequest<MachineInfoDTO>(a, request, (json) =>
        this.responseBuilder.buildMachineInfo(json)
      )
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<MachineInfoDTO>;
  }

  private _getExtendedTypesAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'getExtendedTypes',
    SlotsApiService.HttpMethod
  );

  public getAdditionalDataTypes(request: SimpleBaseRequest): Promise<AdditionalDataTypesResponse> {
    const address = this._getExtendedTypesAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<AdditionalDataTypesResponse | void>>(
      (p, a) =>
        this.doRequest<AdditionalDataTypesResponse>(
          a,
          request,
          AdditionalDataTypesResponse.fromJson
        )
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<AdditionalDataTypesResponse>;
  }

  public startGambleAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'startGamble',
    SlotsApiService.HttpMethod
  );

  public startGamble(request: IDtoObject): Promise<BonusInfoDTO> {
    const address = this.startGambleAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<BonusInfoDTO | void>>((p, a) =>
      this.doRequest<BonusInfoDTO>(a, request, BonusInfoDTO.fromJson)
    )
      .apply(this.retryingParams(address), address)
      .call() as Promise<BonusInfoDTO>;
  }

  public spinAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    EnvironmentConfig.spinMethodName,
    SlotsApiService.HttpMethod
  );

  public spin(
    request: SpinRequest,
    prevSpinResultResponse?: SpinResultResponse | null
  ): Promise<SpinResultResponse> {
    const address = this.spinAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<SpinResultResponse>>((p, a) =>
      this.doRequest<SpinResultResponse>(a, request, (json) =>
        this.responseBuilder.buildSpinResultResponse(json, prevSpinResultResponse, request)
      )
    )
      .apply(this.retryingParams(address), address)
      .call()!;
  }

  private _startModularMachineAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'startModularMachine',
    SlotsApiService.HttpMethod
  );

  public startModularMachine(request: IDtoObject): Promise<ModularMachineInfoDTO> {
    const address = this._startModularMachineAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<ModularMachineInfoDTO | void>>(
      (p, a) =>
        this.doRequest<ModularMachineInfoDTO>(a, request, (json) =>
          this.responseBuilder.buildModularMachineInfo(json)
        )
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<ModularMachineInfoDTO>;
  }

  public pickStaticAddress = new ServiceAddress(
    EnvironmentConfig.url,
    SlotsApiService.ServiceName,
    'pickStatic',
    SlotsApiService.HttpMethod
  );

  public pickStatic(request: TStaticActionParams): Promise<TStaticGamesInfoDTO> {
    const address = this.pickStaticAddress;
    return new FuncEx2<RetryingParams, ServiceAddress, Promise<TStaticGamesInfoDTO | void>>(
      (p, a) => this.doRequest<TStaticGamesInfoDTO>(a, request, TStaticGamesInfoDTO.fromJson)
    )
      .wrap(this.exceptionHandlerFacade.retryWhenNoInternet)
      .wrap(this.exceptionHandlerFacade.retryWhenServerError)
      .wrap(this.exceptionHandlerFacade.logFailedRequest)
      .apply(this.retryingParams(address), address)
      .call() as Promise<TStaticGamesInfoDTO>;
  }
}
