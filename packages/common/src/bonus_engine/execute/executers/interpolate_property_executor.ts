import { IterateExecutor } from './iterate_executor';
import { ConfigConstants } from '../../configuration/config_constants';
import { IMessageContext } from '../i_message_context';
import { SceneObject, SceneObjectMirror } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ExecuteHelper } from '../utils/execute_helper';
import { Convert } from '../../utils/convert';
import { NumberFormatter } from '../../../utils/number_formatter';

export class InterpolatePropertyExecutor extends IterateExecutor {
  private _duration: number;
  private readonly _baseDuration: number;
  private readonly _format: string;
  private _endFormat: string;

  constructor(
    elementId: string,
    property: string,
    startValue: string,
    endValue: string,
    executionType: string,
    baseDuration: number,
    stepDuration: string,
    format: string,
    endFormat: string,
    durationMultiplierValue: string
  ) {
    super({
      [ConfigConstants.elementId]: elementId,
      [ConfigConstants.property]: property,
      [ConfigConstants.propertyStartValue]: startValue,
      [ConfigConstants.propertyEndValue]: endValue,
      [ConfigConstants.executionType]: executionType,
      [ConfigConstants.stepDuration]: stepDuration,
      [ConfigConstants.propertyDurationMultiplierValue]: durationMultiplierValue,
    });
    this._baseDuration = baseDuration;
    this._format = format;
    this._endFormat = endFormat;
  }

  static fromJson(json: Record<string, any>): InterpolatePropertyExecutor {
    return new InterpolatePropertyExecutor(
      json[ConfigConstants.elementId],
      json[ConfigConstants.property],
      json[ConfigConstants.propertyStartValue],
      json[ConfigConstants.propertyEndValue],
      json[ConfigConstants.executionType],
      json[ConfigConstants.duration],
      json[ConfigConstants.stepDuration],
      json[ConfigConstants.valueFormat],
      json[ConfigConstants.endValueFormat],
      json[ConfigConstants.propertyDurationMultiplierValue]
    );
  }

  async iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    const elements = ExecuteHelper.GetAllElementsFromList(
      roots,
      paramsList[ConfigConstants.elementId]
    );
    const startValue = ExecuteHelper.tryParse(paramsList[ConfigConstants.propertyStartValue]);
    const endValue = ExecuteHelper.tryParse(paramsList[ConfigConstants.propertyEndValue]);
    const host = elements.length > 0 ? elements[0] : null;
    if (host && !isNaN(startValue) && !isNaN(endValue)) {
      if (paramsList[ConfigConstants.stepDuration] === 'True') {
        this._duration = this._baseDuration * endValue;
      } else if (
        paramsList[ConfigConstants.stepDuration] === 'MultiplierDuration' &&
        paramsList[ConfigConstants.propertyDurationMultiplierValue]
      ) {
        const durationMultiplier = ExecuteHelper.tryParse(
          paramsList[ConfigConstants.propertyDurationMultiplierValue]
        );
        if (!isNaN(durationMultiplier)) {
          this._duration = this._baseDuration * durationMultiplier;
        }
      } else {
        this._duration = this._baseDuration;
      }

      const task = ExecuteHelper.playInterpolateAction(
        host,
        (v) => {
          if (!token.isCancellationRequested) {
            for (const element of elements) {
              const info = SceneObjectMirror.GetPropertyInfo(
                element.runtimeType, // TODO: заменить на SceneObjectType. Пока не понимаю как вычилсить
                paramsList[ConfigConstants.property]
              );
              let str = Convert.changeType(NumberFormatter.format(Math.round(v!)), info!.type);
              if (this._format) {
                str = Convert.changeType(
                  ExecuteHelper.format(Math.round(v!), this._format),
                  info!.type
                );
              }
              info?.set(element, str);
            }
          }
        },
        this._duration / 1000,
        startValue,
        endValue
      );

      if (paramsList[ConfigConstants.executionType] === 'WithoutDelay') {
        await task;
        if (!token.isCancellationRequested) {
          for (const element of elements) {
            const info = SceneObjectMirror.GetPropertyInfo(
              element.runtimeType, // TODO: заменить на SceneObjectType. Пока не понимаю как вычилсить
              paramsList[ConfigConstants.property]
            );
            let str = Convert.changeType(NumberFormatter.format(endValue), info!.type);
            if (this._format) {
              str = Convert.changeType(ExecuteHelper.format(endValue, this._format), info!.type);
            }
            info?.set(element, str);
          }
        }
      } else {
        await task;
      }
    }
  }
}
