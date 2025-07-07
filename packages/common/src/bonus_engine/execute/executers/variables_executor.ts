import { IterateExecutor } from './iterate_executor';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { VariablesComponent } from '../../components/variables_component';
import { ExecuteHelper } from '../utils/execute_helper';
import { NumberFormatter } from '../../../utils/number_formatter';

export class VariablesExecutor extends IterateExecutor {
  constructor(variable: string, operation: string, value: string) {
    super({
      [ConfigConstants.variableName]: variable,
      [ConfigConstants.operationName]: operation,
      [ConfigConstants.operationValue]: value,
    });
  }

  static fromJson(json: any): VariablesExecutor {
    return new VariablesExecutor(
      json[ConfigConstants.variableName],
      json[ConfigConstants.operationName],
      json[ConfigConstants.operationValue]
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    _roots: SceneObject[],
    _token: CancellationToken
  ): Promise<void> {
    const variablesComponent = context.message?.getValue(
      VariablesComponent.declarationComponent
    ) as VariablesComponent;
    const operationName = paramsList[ConfigConstants.operationName];
    const variableName = paramsList[ConfigConstants.variableName];
    if (operationName === ConfigConstants.operationAssign) {
      variablesComponent.setValue(
        variableName,
        paramsList[ConfigConstants.operationValue].replaceAll(',', '')
      );
      context.message?.setValue(variableName, paramsList[ConfigConstants.operationValue]);
    } else if (
      operationName === ConfigConstants.operationAdd ||
      operationName === ConfigConstants.operationSubtract ||
      operationName === ConfigConstants.operationMultiply ||
      operationName === ConfigConstants.operationDivision
    ) {
      const variable = ExecuteHelper.tryParseDouble(variablesComponent.getValue(variableName));
      const value = ExecuteHelper.tryParseDouble(paramsList[ConfigConstants.operationValue]);
      if (typeof variable === 'number') {
        let result = 0.0;
        if (operationName === ConfigConstants.operationAdd) {
          result = variable + value;
        } else if (operationName === ConfigConstants.operationSubtract) {
          result = variable - value;
        } else if (operationName === ConfigConstants.operationMultiply) {
          result = variable * value;
        } else if (operationName === ConfigConstants.operationDivision) {
          result = variable / value;
        }
        variablesComponent.setValue(variableName, NumberFormatter.format(result));
        context.message?.setValue(variableName, NumberFormatter.format(result));
      }
    }
  }
}
