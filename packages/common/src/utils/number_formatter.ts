import { ApplicationGameConfig } from '@cgs/shared';

export class NumberFormatter {
  private static readonly _1K = 1000;
  private static readonly _10K = 10000;
  private static readonly _100K = 100000;
  private static readonly _1M = 1000000;
  private static readonly _10M = 10000000;
  private static readonly _100M = 100000000;
  private static readonly _1B = 1000000000;
  private static readonly _10B = 10000000000;
  private static readonly _100B = 100000000000;
  private static readonly _1t = 1000000000000;
  private static readonly _100t = 100000000000000;
  private static readonly _1q = 1000000000000000;
  private static readonly _1Q = 1000000000000000000; // TODO: JS max number is less then this value
  private static readonly _1s = 1000000000000000000000;
  private static readonly _1S = 1000000000000000000000000;
  private static readonly _1o = 1000000000000000000000000000;

  private static readonly _dividers: [number, string][] = [
    [NumberFormatter._1K, 'K'],
    [NumberFormatter._1M, 'M'],
    [NumberFormatter._1B, 'B'],
    [NumberFormatter._1t, 't'],
    [NumberFormatter._1q, 'q'],
    [NumberFormatter._1Q, 'Q'],
    [NumberFormatter._1s, 's'],
    [NumberFormatter._1S, 'S'],
    [NumberFormatter._1o, 'o'],
  ];

  private static get currency(): string {
    return ApplicationGameConfig.currency;
  }

  public static format(value: number, numDecimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: numDecimals,
      maximumFractionDigits: numDecimals,
    }).format(value);
  }

  public static formatMoney(value: number, numDecimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: NumberFormatter.currency,
      minimumFractionDigits: numDecimals,
      maximumFractionDigits: numDecimals,
    }).format(value);
  }

  public static formatMoneyShort(money: number, numDigits = 0): string {
    let result = NumberFormatter.formatMoney(money);
    if (NumberFormatter.getDigitsCount(result) <= numDigits) {
      return result;
    }

    for (const divider of NumberFormatter._dividers) {
      result = NumberFormatter.formatMoney(
        NumberFormatter.divideWithOneDecimal(money, divider[0]),
        1
      );
      if (NumberFormatter.getDigitsCount(result) <= numDigits) {
        return result + divider[1];
      }

      result = NumberFormatter.formatIntegerRoundDown(money / divider[0]);
      if (NumberFormatter.getDigitsCount(result) <= numDigits) {
        return result + divider[1];
      }
    }

    return result + 'B';
  }

  public static formatValueShortDownBonus(
    jackpotValue: number,
    numDigitsRaw = 8,
    roundUp = false,
    trailingZero = false
  ): string {
    if (Math.trunc(jackpotValue) < 1000) {
      return NumberFormatter.format(Math.trunc(jackpotValue), 0);
    }

    let result = trailingZero
      ? NumberFormatter.format(Math.trunc(jackpotValue), 1)
      : NumberFormatter.format(Math.trunc(jackpotValue), 0);

    const absqLength = 1;
    const dotLength = trailingZero ? 1 : 0;
    const numDigits = numDigitsRaw - absqLength - dotLength;

    if (NumberFormatter.getDigitsCount(result) <= numDigits) {
      return result;
    }

    for (const divider of NumberFormatter._dividers) {
      result = NumberFormatter.format(
        NumberFormatter.divideWithOneDecimalRoundDown(jackpotValue, divider[0], roundUp),
        1
      );
      if (NumberFormatter.getDigitsCount(result) <= numDigits) {
        return result + divider[1];
      }

      result = NumberFormatter.formatIntegerRoundDown(jackpotValue / divider[0], roundUp);
      if (NumberFormatter.getDigitsCount(result) <= numDigits) {
        return result + divider[1];
      }
    }

    return result + 'B';
  }

  public static formatJackpotLong(val: number, roundUp = false): string {
    const longVal = val;

    if (longVal < NumberFormatter._10M) {
      return NumberFormatter.formatInteger(longVal, roundUp);
    }
    if (longVal >= NumberFormatter._10M && longVal < NumberFormatter._100M) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1K, roundUp)
        ) + 'K'
      );
    }
    if (longVal >= NumberFormatter._100M && longVal < NumberFormatter._1B) {
      return NumberFormatter.formatInteger(longVal / NumberFormatter._1K, roundUp) + 'K';
    }
    if (longVal >= NumberFormatter._1B && longVal < NumberFormatter._10B) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1M, roundUp)
        ) + 'M'
      );
    }
    if (longVal >= NumberFormatter._10B && longVal < NumberFormatter._100B) {
      return NumberFormatter.formatInteger(longVal / NumberFormatter._1M, roundUp) + 'M';
    }
    if (longVal >= NumberFormatter._100B && longVal < NumberFormatter._1t) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1B, roundUp)
        ) + 'B'
      );
    }
    return NumberFormatter.formatInteger(longVal / NumberFormatter._1B, roundUp) + 'B';
  }

  public static formatLongCoins(val: number, withSpace = false): string {
    const longVal = val;
    if (val < NumberFormatter._10K) {
      return NumberFormatter.formatInteger(longVal);
    }
    if (val < NumberFormatter._1M) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1K)
        ) + (withSpace ? ' K' : 'K')
      );
    }
    if (val < NumberFormatter._1B) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1M)
        ) + (withSpace ? ' M' : 'M')
      );
    }
    if (val < NumberFormatter._1t) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1B)
        ) + (withSpace ? ' B' : 'B')
      );
    }
    if (val < NumberFormatter._1q) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1t)
        ) + (withSpace ? ' t' : 't')
      );
    }
    if (val < NumberFormatter._1Q) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1q)
        ) + (withSpace ? ' q' : 'q')
      );
    }
    if (val < NumberFormatter._1s) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1Q)
        ) + (withSpace ? ' Q' : 'Q')
      );
    }
    if (val < NumberFormatter._1S) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1s)
        ) + (withSpace ? ' s' : 's')
      );
    }
    if (val < NumberFormatter._1o) {
      return (
        NumberFormatter.formatDecimal(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1S)
        ) + (withSpace ? ' S' : 'S')
      );
    }
    return NumberFormatter.formatInteger(longVal / NumberFormatter._1o) + (withSpace ? ' o' : 'o');
  }

  public static formatLongCoins1K(val: number, withSpace = false, numCount = 0): string {
    const longVal = val;
    if (val < NumberFormatter._1K) {
      return NumberFormatter.formatInteger(longVal);
    }
    if (val < NumberFormatter._1M) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1K),
          numCount
        ) + (withSpace ? ' K' : 'K')
      );
    }
    if (val < NumberFormatter._1B) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1M),
          numCount
        ) + (withSpace ? ' M' : 'M')
      );
    }
    if (val < NumberFormatter._1t) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1B),
          numCount
        ) + (withSpace ? ' B' : 'B')
      );
    }
    if (val < NumberFormatter._1q) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1t),
          numCount
        ) + (withSpace ? ' t' : 't')
      );
    }
    if (val < NumberFormatter._1Q) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1q),
          numCount
        ) + (withSpace ? ' q' : 'q')
      );
    }
    if (val < NumberFormatter._1s) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1Q),
          numCount
        ) + (withSpace ? ' Q' : 'Q')
      );
    }
    if (val < NumberFormatter._1S) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1s),
          numCount
        ) + (withSpace ? ' s' : 's')
      );
    }
    if (val < NumberFormatter._1o) {
      return (
        NumberFormatter.formatDecimalDown(
          NumberFormatter.divideWithOneDecimal(longVal, NumberFormatter._1S),
          numCount
        ) + (withSpace ? ' S' : 'S')
      );
    }
    return NumberFormatter.formatInteger(longVal / NumberFormatter._1o) + (withSpace ? ' o' : 'o');
  }

  public static formatWinLong(val: number, targetLength: number): string {
    if (targetLength < 4) {
      throw new Error('targetLength must be greater or equal than 4');
    }

    const valueLength =
      val > 0 ? Math.trunc(NumberFormatter.log10(Math.abs(val + 0.000001)) + 1) : 0;
    const dotLength = 0;
    const abbrLength = 1;

    if (valueLength <= targetLength) {
      return NumberFormatter.format(val, 2);
    }

    const targetValueLength = targetLength - (dotLength + abbrLength);
    const lengthDelta = Math.min(valueLength - targetValueLength, 24);
    let closestAbbrDelta = Math.floor(lengthDelta / 3) * 3;
    if (lengthDelta % 3 !== 0) {
      closestAbbrDelta += 3;
    }
    const decimals = closestAbbrDelta - lengthDelta;
    const mantissa = Math.trunc(val / Math.pow(10, lengthDelta));
    const reducedValue = mantissa / Math.pow(10, decimals);

    let abbreviation: string;
    switch (closestAbbrDelta) {
      case 3:
        abbreviation = 'K';
        break;
      case 6:
        abbreviation = 'M';
        break;
      case 9:
        abbreviation = 'B';
        break;
      case 12:
        abbreviation = 't';
        break;
      case 15:
        abbreviation = 'q';
        break;
      case 18:
        abbreviation = 'Q';
        break;
      case 21:
        abbreviation = 's';
        break;
      case 24:
        abbreviation = 'S';
        break;
      default:
        abbreviation = 'B';
        break;
    }

    return NumberFormatter.format(reducedValue, 2) + abbreviation;
  }

  private static log10(value: number): number {
    return Math.log(value) / Math.log(10);
  }

  private static divideWithOneDecimal(longVal: number, _1K: number, roundUp = false): number {
    let integerDivision = (longVal / _1K) * 10;
    if (roundUp && integerDivision < (longVal / _1K) * 10.0) {
      integerDivision += 1;
    }
    return integerDivision / 10.0;
  }

  private static divideWithOneDecimalRoundDown(
    longVal: number,
    _1K: number,
    roundUp = false
  ): number {
    let integerDivision = Math.floor((longVal / _1K) * 10);
    if (roundUp && integerDivision < (longVal / _1K) * 10.0) {
      integerDivision += 1;
    }
    return integerDivision / 10.0;
  }

  private static formatDecimal(val: number): string {
    return NumberFormatter._formatCurrency(val, false, 1);
  }

  private static formatInteger(val: number, roundUp = false): string {
    if (!roundUp) {
      return NumberFormatter._formatCurrency(val, false, 0);
    }
    return NumberFormatter._formatCurrency(Math.ceil(val), false, 0);
  }

  private static formatDecimalDown(val: number, numCount = 0): string {
    val = Math.floor(val * 10) / 10;
    let result = NumberFormatter._formatCurrency(val, false, 1);
    if (numCount > 0) {
      let parts = val.toString().split(',');
      if (val.toString().includes('.')) {
        parts = val.toString().split('.');
      }
      if (parts[0].length >= numCount) {
        result = NumberFormatter._formatCurrency(Math.floor(val), false, 1);
      }
    }
    return result;
  }

  private static formatIntegerRoundDown(val: number, roundUp = false): string {
    if (!roundUp) {
      return NumberFormatter._formatCurrency(Math.floor(val), false, 0);
    }
    return NumberFormatter._formatCurrency(Math.ceil(val), false, 0);
  }

  private static _formatCurrency(value: number, padRight: boolean, precision = 2): string {
    let sb = '';
    const prec = Math.pow(10, precision);
    const rounded = Math.round(value * prec);
    const quotient = Math.trunc(rounded / prec);
    const groups: number[] = [];
    let tempQuotient = quotient;
    while (tempQuotient >= 1000) {
      const rem = tempQuotient % 1000;
      groups.unshift(rem);
      tempQuotient = Math.trunc(tempQuotient / 1000);
    }

    sb += quotient;
    for (const val of groups) {
      sb += ',';
      sb += val.toString().padStart(3, '0');
    }
    const remained = rounded % prec;
    if (remained !== 0) {
      sb += '.';
      let fraction = remained.toString().padStart(precision, '0');
      if (!padRight) {
        while (fraction.endsWith('0')) {
          fraction = fraction.substring(0, fraction.length - 1);
        }
      }
      sb += fraction;
    }
    return sb.toString();
  }

  private static getDigitsCount(number: string): number {
    return number.replace(/\D/g, '').length;
  }
}
