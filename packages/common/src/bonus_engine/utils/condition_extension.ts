import { ConditionConfiguration } from '../configuration/elements/condition_configuration';
import { IMessageContext } from '../execute/i_message_context';
import { ConditionOperation } from '../enums/condition_operation';

export class ConditionExtension {
  static check(condition: ConditionConfiguration, messageContext: IMessageContext): boolean {
    const properties = messageContext.resolve(condition.property);
    const values = condition.value ? messageContext.resolve(condition.value) : [];
    switch (condition.operation) {
      case ConditionOperation.Equality:
        if (properties.length !== values.length) {
          return false;
        }
        return this.checkEquality(properties, values);
      case ConditionOperation.Inequality:
        if (properties.length !== values.length) {
          return false;
        }
        return !this.checkEquality(properties, values);
      case ConditionOperation.Contains:
        return (
          properties.length !== 0 &&
          values.length !== 0 &&
          values.every((v) => properties.includes(v))
        );
      case ConditionOperation.Belongs:
        return (
          properties.length !== 0 &&
          values.length !== 0 &&
          properties.every((p) => values.includes(p))
        );
      case ConditionOperation.IsAny:
        return properties.length !== 0;
      case ConditionOperation.IsEmpty:
        return properties.length === 0;
      default:
        return false;
    }
  }

  static checkEquality(properties: string[], values: string[]): boolean {
    return properties.length === values.length && properties.every((p, i) => p === values[i]);
  }
}
