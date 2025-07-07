import { IServiceAddressCondition } from './service_address_condition';

export class ConditionPair {
  private readonly _condition1: IServiceAddressCondition;
  private readonly _condition2: IServiceAddressCondition;

  constructor(condition1: IServiceAddressCondition, condition2: IServiceAddressCondition) {
    this._condition1 = condition1;
    this._condition2 = condition2;
  }

  get condition1(): IServiceAddressCondition {
    return this._condition1;
  }

  get condition2(): IServiceAddressCondition {
    return this._condition2;
  }
}
