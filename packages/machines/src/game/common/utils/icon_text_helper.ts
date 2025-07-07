import { Tuple3, SceneObject, BitmapTextSceneObject } from '@cgs/syd';

export class IconTextHelper {
  static readonly JackpotTypes: string[] = ['mini', 'minor', 'major', 'grand'];

  static readonly DELAY_BETWEEN_COLLECTS: number = 0.35;
  static readonly DELAY_BETWEEN_ROTATE_AND_COLLECT: number = 0.3;
  static readonly DELAY_BETWEEN_TRANSFORMATION_AND_EXPAND: number = 0.3;
  static readonly COLLECT_ANIMATION_DURATION: number = 0.49;

  static getEnabledFeatures(name: string): Tuple3<boolean, boolean, boolean> {
    let activeJPPerk: boolean = false;
    let activePrizePerk: boolean = false;
    let activeExpandPerk: boolean = false;
    switch (name) {
      case 'FG0':
        activeJPPerk = true;
        break;
      case 'FG1':
        activePrizePerk = true;
        break;
      case 'FG2':
        activeExpandPerk = true;
        break;
      case 'FG01':
        activeJPPerk = true;
        activePrizePerk = true;
        break;
      case 'FG02':
        activeJPPerk = true;
        activeExpandPerk = true;
        break;
      case 'FG12':
        activePrizePerk = true;
        activeExpandPerk = true;
        break;
      case 'FG012':
        activeJPPerk = true;
        activePrizePerk = true;
        activeExpandPerk = true;
        break;
    }
    return new Tuple3<boolean, boolean, boolean>(activeJPPerk, activePrizePerk, activeExpandPerk);
  }

  static format(value: number, digits: number, trailingZero: boolean = false): string {
    let isNeedDot: boolean = true;
    let addLetter: boolean = true;
    let startValue: number = Math.round(value);
    const letters: string[] = [
      '0',
      'K',
      'M',
      'B',
      't',
      'q',
      'Q',
      's',
      'S',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'L',
      'N',
      'O',
      'R',
      'S',
      'U',
      'V',
    ];
    let i: number = 0;
    if (value < Math.pow(10, digits)) {
      isNeedDot = false;
      addLetter = false;
      digits = Math.round(value).toString().length;
    }
    while (value >= 1000) {
      value /= 1000;
      i++;
    }
    let digitCounter: number;
    while (startValue > Math.pow(10, digits)) {
      startValue /= 10;
    }
    let newValue: string = startValue.toString().substring(0, digits);
    let valueInt: number = Math.floor(value);
    let valueSize: number = valueInt.toString().length;
    if ((digits - valueSize) % 3 != 0) {
      digitCounter = (digits - valueSize) / 3 + 1;
      i = i - digitCounter + 1;
    } else {
      isNeedDot = false;
      digitCounter = (digits - valueSize) / 3;
      i -= digitCounter;
    }
    let endValue: string = '';
    for (let j = 0; j < digitCounter; j++) {
      let c = 4 * j + valueSize;
      if (j == digitCounter - 1 && isNeedDot) {
        newValue = newValue.substring(0, c) + '.' + newValue.substring(c);
        if (trailingZero == false) {
          if (newValue.substring(newValue.length - 1) == '0') {
            newValue += ' ';
            newValue = newValue.replaceAll('0 ', '');
          }
        }
      } else {
        newValue = newValue.substring(0, c) + ',' + newValue.substring(c);
      }
    }
    let preText: string = newValue;
    if (addLetter) {
      preText = newValue + ' ' + letters[i];
    }

    let finalText: string = preText.replaceAll('.0 ', '');
    finalText = finalText.replaceAll('.00 ', '');
    finalText = finalText.replaceAll('.000 ', '');
    finalText = finalText.replaceAll('. ', '');
    finalText = finalText.replaceAll(' ', '');

    return finalText;
  }

  static formatCoinsOnIcon(textValue: number, digits: number = 3): string {
    let preText: string = IconTextHelper.format(textValue, digits);
    return preText;
  }

  static updateTextOnIcon(iconNode: SceneObject, value: string, id: string = 'icon_txt'): void {
    let texts: BitmapTextSceneObject[] = iconNode
      .findAllByIdAndType(id, BitmapTextSceneObject)
      .map((item) => item as BitmapTextSceneObject);
    if (texts && texts.some((_) => true)) for (let text of texts) text.text = value;
  }
}
