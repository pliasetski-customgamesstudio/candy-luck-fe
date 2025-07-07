import { ServiceAddress } from './service_address';
import { IServiceAddressCondition } from './service_address_condition';
import { RequestSynchronizerConfig } from './request_synchronizer_config';
import { Completer, IDisposable } from '@cgs/syd';
import { DisposeAction } from '@cgs/shared';

export const T_IRequestSynchronizer = Symbol('IRequestSynchronizer');

export interface IRequestSynchronizer {
  startExecutingRequest(address: ServiceAddress): Promise<IDisposable>;
}

export class RequestSynchronizer implements IRequestSynchronizer {
  private _conditionMap: Map<IServiceAddressCondition, Set<IServiceAddressCondition>> = new Map<
    IServiceAddressCondition,
    Set<IServiceAddressCondition>
  >();
  private _runningRequests: RequestCompletion[] = [];
  // private _semaphoreSlim: Semaphore = new Semaphore(1);

  constructor(config: RequestSynchronizerConfig) {
    for (const conditionPair of config.requestsToSync) {
      if (!this._conditionMap.has(conditionPair.condition1)) {
        this._conditionMap.set(conditionPair.condition1, new Set<IServiceAddressCondition>());
      }
      if (!this._conditionMap.has(conditionPair.condition2)) {
        this._conditionMap.set(conditionPair.condition2, new Set<IServiceAddressCondition>());
      }
      this._conditionMap.get(conditionPair.condition1)!.add(conditionPair.condition2);
      this._conditionMap.get(conditionPair.condition2)!.add(conditionPair.condition1);
    }
  }

  public async startExecutingRequest(address: ServiceAddress): Promise<IDisposable> {
    const requestCompletion = new RequestCompletion(address, new Completer<void>());
    let started = await this.tryStartRequest(requestCompletion);
    while (!started) {
      // await this.waitDependantRequests(requestCompletion.address);
      started = await this.tryStartRequest(requestCompletion);
    }
    return new DisposeAction(() => {
      this._runningRequests = this._runningRequests.filter((r) => r !== requestCompletion);
      requestCompletion.completion.complete();
    });
  }

  // private async waitDependantRequests(address: ServiceAddress): Promise<void> {
  //   const tasks = this._getDependantTasks(address);
  //   try {
  //     await Promise.all(tasks);
  //   } catch (e) {
  //     // ignore exceptions in request
  //   }
  // }

  // private _getDependantTasks(address: ServiceAddress): Promise<void>[] {
  //   const dependantConditions = Array.from(this._conditionMap.keys())
  //     .filter(condition => condition.isAdressMatch(address))
  //     .map(key => this._conditionMap.get(key))
  //     .reduce((list, conditions) => {
  //       list.push(...conditions);
  //       return list;
  //     }, []);
  //   return this._runningRequests
  //     .filter(r => dependantConditions.some(condition => condition.isAdressMatch(r.address)))
  //     .map(r => r.completion);
  // }

  private async tryStartRequest(requestCompletion: RequestCompletion): Promise<boolean> {
    try {
      // await this._semaphoreSlim.acquire();

      // if (this._getDependantTasks(requestCompletion.address).length > 0) {
      //   return false;
      // }

      this._runningRequests.push(requestCompletion);
      return true;
    } finally {
      // this._semaphoreSlim.release();
    }
  }
}

export class RequestCompletion {
  private readonly _address: ServiceAddress;
  private readonly _completion: Completer<void>;

  constructor(address: ServiceAddress, completion: Completer<void>) {
    this._address = address;
    this._completion = completion;
  }

  get address(): ServiceAddress {
    return this._address;
  }

  get completion(): Completer<void> {
    return this._completion;
  }
}
