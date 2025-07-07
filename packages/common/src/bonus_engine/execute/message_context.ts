import { IMessageContext } from './i_message_context';
import { RoundMessage } from '../messaging/round_message';
import { BonusContext } from '../messaging/bonus_context';

export class MessageContext implements IMessageContext {
  static readonly StartParamSymbol = '{';
  static readonly EndParamSymbol = '}';
  static readonly StartListChar = '[';
  static readonly EndListChar = ']';
  static readonly ItemsSeparator = ',';

  private readonly _message: RoundMessage | null;
  private readonly _bonusContext: BonusContext;

  constructor(message: RoundMessage | null, bonusContext: BonusContext) {
    this._message = message;
    this._bonusContext = bonusContext;
  }

  get message(): RoundMessage | null {
    return this._message;
  }

  resolve(str: string): string[] {
    if (!str) {
      return [];
    }

    let result = [str];
    let endSquare: number, endCurve: number;
    let startIndex = str.length - 1;
    do {
      endSquare = str.lastIndexOf(MessageContext.EndListChar, startIndex);
      endCurve = str.lastIndexOf(MessageContext.EndParamSymbol, startIndex);
      if (endSquare !== -1 && (endCurve === -1 || endSquare > endCurve)) {
        const startSquare = this._openingIndex(
          str,
          MessageContext.StartListChar,
          MessageContext.EndListChar,
          endSquare
        );
        startIndex = startSquare;
        const newParams = this._resolveList(str.substring(startSquare + 1, endSquare));
        result = this._merge(result, newParams, startSquare, endSquare);
      } else if (endCurve !== -1 && (endSquare === -1 || endCurve > endSquare)) {
        const startCurve = this._openingIndex(
          str,
          MessageContext.StartParamSymbol,
          MessageContext.EndParamSymbol,
          endCurve
        );
        startIndex = startCurve;
        const newParams = this._resolveParam(str.substring(startCurve + 1, endCurve));
        result = this._merge(result, newParams, startCurve, endCurve);
      }
    } while ((endSquare !== -1 || endCurve !== -1) && result.length > 0);
    return result;
  }

  private _closingIndex(
    str: string,
    openingSymbol: string,
    closingSymbol: string,
    startIndex: number
  ): number {
    let delta = 0;
    for (let i = startIndex; i < str.length; i++) {
      const cur = str[i];
      if (cur === openingSymbol) {
        if (++delta === 0) {
          return i;
        }
      } else if (cur === closingSymbol) {
        if (--delta === 0) {
          return i;
        }
      }
    }
    return -1;
  }

  private _openingIndex(
    str: string,
    openingSymbol: string,
    closingSymbol: string,
    startIndex: number
  ): number {
    let delta = 0;
    for (let i = startIndex; i >= 0; i--) {
      const cur = str[i];
      if (cur === openingSymbol) {
        if (++delta === 0) {
          return i;
        }
      } else if (cur === closingSymbol) {
        if (--delta === 0) {
          return i;
        }
      }
    }
    return -1;
  }

  private _merge(
    first: string[],
    second: string[],
    openingIndex: number,
    closingIndex: number
  ): string[] {
    if (first.length === 1) {
      return second.map((s) =>
        this._replaceAt(first[0], openingIndex, closingIndex - openingIndex + 1, s)
      );
    }
    if (second.length === 1) {
      return first.map((s) =>
        this._replaceAt(s, openingIndex, closingIndex - openingIndex + 1, second[0])
      );
    }
    const result: string[] = [];
    for (let i = 0, n = Math.min(first.length, second.length); i < n; i++) {
      result.push(
        this._replaceAt(first[i], openingIndex, closingIndex - openingIndex + 1, second[i])
      );
    }
    return result;
  }

  private _resolveList(str: string): string[] {
    const elements = str.split(MessageContext.ItemsSeparator);
    return elements.flatMap((element) => this.resolve(element.trim()));
  }

  private _resolveParam(propName: string): string[] {
    const result: string[] = [];
    let props = this._message?.properties;
    const propIndex = propName.split(MessageContext.ItemsSeparator);
    if (propIndex.length === 3) {
      const roundIndex = parseInt(propIndex[0].trim(), 10);
      const contextIndex = parseInt(propIndex[1].trim(), 10);
      const propValues = this._bonusContext.getProperties(roundIndex, contextIndex);

      if (propValues) {
        props = propValues;
      } else {
        console.debug(
          `There is no record of bonus round: ${roundIndex}, index ${contextIndex} in bonus context`
        );
      }
    } else if (propIndex.length === 2) {
      const roundIndex = parseInt(propIndex[0].trim());
      const propValues = this._bonusContext.getRoundProperties(roundIndex);

      if (propValues.length) {
        props = propValues[propValues.length - 1];
      } else {
        console.debug(`There is no record of bonus round: ${roundIndex} in bonus context`);
      }
    } else if (propIndex.length > 3) {
      throw new Error('Correct format {x,x,x}');
    }

    const values = this.resolve(propIndex[propIndex.length - 1].trim());
    for (const value of values) {
      const paramValue = props?.get(value);
      if (typeof paramValue === 'string') {
        result.push(...this.resolve(paramValue));
      } else if (Array.isArray(paramValue)) {
        for (const v of paramValue) {
          if (typeof v === 'string') {
            result.push(...this.resolve(v));
          } else {
            result.push(v.toString());
          }
        }
      } else if (paramValue || typeof paramValue === 'number') {
        result.push(paramValue.toString());
      }
    }

    return result;
  }

  private _replaceAt(str: string, index: number, length: number, replace: string): string {
    return str.substring(0, index) + replace + str.substring(index + length);
  }
}
