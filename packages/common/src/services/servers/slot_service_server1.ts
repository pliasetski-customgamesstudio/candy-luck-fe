import {
  SlotsApiService,
  IRequestSettings,
  SpinRequest,
  ModularSpinResultResponse,
  ServiceAddress,
  RetryingParams,
  TStaticActionParams,
  TStaticGamesInfoDTO,
  BonusPickRequest,
  BonusInfoDTO,
  ScatterPickRequest,
  SpinResultResponse,
  UserState,
  StartMachineRequest,
  MachineInfoDTO,
  ModularMachineInfoDTO,
} from '@cgs/network';
import { EventDispatcher } from '@cgs/syd';
import { ISlotsApiService } from '../i_slot_api_service';
import { ISimpleUserInfoHolder } from '../simple_user_info_holder';
import { ISlotsApiListener } from '../i_slots_api_listener';
import { ISlotApiWatcher } from '../i_slot_api_watcher';
import { IAuthorizationHolder } from '../authorization/i_authorization_holder';
import { ArkadiumSdk } from '@cgs/shared';

export class SlotServiceServer1 implements ISlotsApiService, ISlotApiWatcher {
  static readonly ServiceName: string = 'slots';
  private readonly _slotApiService: SlotsApiService;
  private readonly _sessionHolder: IAuthorizationHolder;
  private readonly _userInfoHolder: ISimpleUserInfoHolder;
  private readonly _requestSettings: IRequestSettings;

  private readonly _listeners: ISlotsApiListener[] = [];
  private readonly _wonEventDispatcher: EventDispatcher<number> = new EventDispatcher<number>();

  constructor(
    slotApiService: SlotsApiService,
    sessionHolder: IAuthorizationHolder,
    userInfoHolder: ISimpleUserInfoHolder,
    requestSettings: IRequestSettings
  ) {
    this._slotApiService = slotApiService;
    this._sessionHolder = sessionHolder;
    this._userInfoHolder = userInfoHolder;
    this._requestSettings = requestSettings;
  }

  private sendFirstSpinEventIfNeeded(): void {}

  async modularSpin(request: SpinRequest): Promise<ModularSpinResultResponse> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: ModularSpinResultResponse = await this._slotApiService.modularSpin(request);

    this.sendFirstSpinEventIfNeeded();

    await this._userInfoHolder.updateUserInfoSafe(res.userState!.userInfo);

    if ((res.totalWin || 0) > 0) {
      this._wonEventDispatcher.dispatchEvent();
    }

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onModularSpin(request, res);
    }

    return res;
  }

  async pickStatic(request: TStaticActionParams): Promise<TStaticGamesInfoDTO> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: TStaticGamesInfoDTO = await this._slotApiService.pickStatic(request);
    if (res.userInfo) {
      await this._userInfoHolder.updateUserInfoSafe(res.userInfo);
      this._wonEventDispatcher.dispatchEvent();
    }

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onPickStatic(request, res);
    }

    return res;
  }

  async pickBonus(request: BonusPickRequest): Promise<BonusInfoDTO> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    request.externalUserId = this._sessionHolder.externalUserId;

    const res: BonusInfoDTO = await this._slotApiService.pickBonus(request);
    if (res.userInfo) {
      await this._userInfoHolder.updateUserInfoSafe(res.userInfo);
      this._wonEventDispatcher.dispatchEvent();
    }

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onPickBonus(request, res);
    }

    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('pickBonus');
    console.log(JSON.stringify(res));
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    return res;
  }

  async pickScatter(request: ScatterPickRequest): Promise<BonusInfoDTO> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: BonusInfoDTO = await this._slotApiService.pickScatter(request);

    await this._userInfoHolder.updateUserInfoSafe(res.userInfo!);

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onPickScatter(request, res);
    }

    return res;
  }

  async extraBetSpin(request: SpinRequest): Promise<SpinResultResponse> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: SpinResultResponse = await this._slotApiService.extraBetSpin(request);

    this.sendFirstSpinEventIfNeeded();

    await this._userInfoHolder.updateUserInfoSafe(res.userState?.userInfo);

    if (res.machineState && (res.machineState.totalWin ?? 0.0) > 0) {
      this._wonEventDispatcher.dispatchEvent();
    }

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onSpin(request, res);
    }

    return res;
  }

  async spin(request: SpinRequest): Promise<SpinResultResponse> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    request.externalUserId = this._sessionHolder.externalUserId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: SpinResultResponse = await this._slotApiService.spin(request);

    this.sendFirstSpinEventIfNeeded();

    if (!res.userState) {
      res.userState = new UserState(this._userInfoHolder.user);
    }
    await this._userInfoHolder.updateUserInfoSafe(res.userState.userInfo);

    if (res.machineState && (res.machineState.totalWin ?? 0.0) > 0) {
      this._wonEventDispatcher.dispatchEvent();
    }

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onSpin(request, res);
    }

    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('spin');
    console.log(JSON.stringify(res));
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    // TODO: ARKADIUM: need proper place for this
    ArkadiumSdk.getInstance().onChangeScore(res.userState.userInfo.balance);

    return res;
  }

  async startGamble(request: StartMachineRequest): Promise<BonusInfoDTO> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: BonusInfoDTO = await this._slotApiService.startGamble(request);

    await this._userInfoHolder.updateUserInfoSafe(res.userInfo!);

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onStartGamble(request, res);
    }

    return res;
  }

  async startMachine(request: StartMachineRequest): Promise<MachineInfoDTO> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    request.externalUserId = this._sessionHolder.externalUserId;

    const res: MachineInfoDTO = await this._slotApiService.startMachine(request);

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onStartMachine(request, res);
    }

    return res;
  }

  async startModularMachine(request: StartMachineRequest): Promise<ModularMachineInfoDTO> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    const res: ModularMachineInfoDTO = await this._slotApiService.startModularMachine(request);

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onStartModularMachine(request, res);
    }

    return res;
  }

  async tutorialSpin(request: SpinRequest): Promise<SpinResultResponse> {
    request.session = this._sessionHolder.session;
    request.userId = this._sessionHolder.userId;
    // request.sequenceNumber = this._sessionHolder.requestSequenceNumber;

    const res: SpinResultResponse = await this._slotApiService.tutorialSpin(request);

    this.sendFirstSpinEventIfNeeded();

    await this._userInfoHolder.updateUserInfoSafe(res.userState?.userInfo);

    if (res.machineState && (res.machineState.totalWin ?? 0.0) > 0) {
      this._wonEventDispatcher.dispatchEvent();
    }

    const listeners: ISlotsApiListener[] = this._getListeners();
    for (const listener of listeners) {
      await listener.onTutorialSpin(request, res);
    }

    return res;
  }

  // get won(): Stream {
  //   return this._wonEventDispatcher.eventStream;
  // }

  registerListener(listener: ISlotsApiListener): void {
    if (this._listeners.includes(listener)) {
      return;
    }
    this._listeners.push(listener);
  }

  unregisterListener(listener: ISlotsApiListener): void {
    const index: number = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  // private async incrementSequenceNumber<T>(
  //   taskFactory: Func2<RetryingParams, ServiceAddress, Promise<T>>,
  //   retrying: RetryingParams,
  //   addr: ServiceAddress
  // ): Promise<T> {
  //   try {
  //     const res: T = (await taskFactory(retrying, addr)) as T;
  //     return res;
  //   } finally {
  //     this._sessionHolder.incrementRequestSequenceNumber();
  //   }
  // }

  private getRetryingParams(addr: ServiceAddress): RetryingParams {
    return this._requestSettings.getRetryingParams(addr.serviceName, addr.restPath);
  }

  private _getListeners(): ISlotsApiListener[] {
    const listeners: ISlotsApiListener[] = [];
    listeners.push(...this._listeners);
    return listeners;
  }
}
