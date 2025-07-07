import { ConditionPair } from './condition_pair';

export const T_RequestSynchronizerConfig = Symbol('RequestSynchronizerConfig');

export class RequestSynchronizerConfig {
  private readonly _requestsToSync: ConditionPair[];

  constructor(requestsToSync: ConditionPair[]) {
    this._requestsToSync = requestsToSync;
  }

  get requestsToSync(): ConditionPair[] {
    return this._requestsToSync;
  }
}
