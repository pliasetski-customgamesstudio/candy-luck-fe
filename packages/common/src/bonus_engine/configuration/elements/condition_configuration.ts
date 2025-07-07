import { ConditionOperation, parseConditionOperationEnum } from '../../enums/condition_operation';
import { ConfigConstants } from '../config_constants';

export class ConditionConfiguration {
  property: string;
  value: string;
  operation: ConditionOperation;

  constructor(json: Record<string, any>) {
    this.property = json[ConfigConstants.conditionProperty];
    this.value = json[ConfigConstants.conditionValue];
    this.operation = json[ConfigConstants.conditionOperation]
      ? parseConditionOperationEnum(json[ConfigConstants.conditionOperation])
      : ConditionOperation.Equality;
  }
}
