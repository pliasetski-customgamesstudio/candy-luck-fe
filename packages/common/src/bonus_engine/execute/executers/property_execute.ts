import { IterateExecutor } from './iterate_executor';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { SceneObject, SceneObjectMirror } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ExecuteHelper } from '../utils/execute_helper';
import { Convert } from '../../utils/convert';

export class PropertyExecute extends IterateExecutor {
  private readonly _format: string;

  constructor(elementId: string, property: string, value: string, format: string) {
    super({
      [ConfigConstants.elementId]: elementId,
      [ConfigConstants.property]: property,
      [ConfigConstants.propertyValue]: value,
    });
    this._format = format;
  }

  static fromJson(json: any): PropertyExecute {
    return new PropertyExecute(
      json[ConfigConstants.elementId],
      json[ConfigConstants.property],
      json[ConfigConstants.propertyValue],
      json[ConfigConstants.valueFormat]
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    _token: CancellationToken
  ): Promise<void> {
    const elements = ExecuteHelper.GetAllElementsFromList(
      roots,
      paramsList[ConfigConstants.elementId]
    );
    for (const element of elements) {
      let str = paramsList[ConfigConstants.propertyValue];
      if (this._format) {
        const value = ExecuteHelper.tryParseDouble(str);
        if (!isNaN(value)) {
          str = ExecuteHelper.format(value, this._format);
        }
      }

      const info = SceneObjectMirror.GetPropertyInfo(
        element.runtimeType, // TODO: заменить на SceneObjectType. Пока не понимаю как вычилсить
        paramsList[ConfigConstants.property]
      );
      info?.set(element, Convert.changeType(str, info.type));
    }
  }
}
