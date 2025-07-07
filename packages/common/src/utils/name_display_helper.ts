import { StringUtils } from '@cgs/shared';
import { DimensionSourceScale, TextSceneObject, TtfTextSceneObject } from '@cgs/syd';

export class NameDisplayHelper {
  static formatNameForDisplay(name: string, maxLength: number = 15): string {
    if (!name) {
      return '-';
    }
    return name.length <= maxLength ? name : name.substring(0, maxLength) + '...';
  }

  static setNameText(textNode: TextSceneObject, name: string): void {
    name = name ?? '-';
    textNode.textRenderParams.dimensionSourceScale = DimensionSourceScale.UpOnly;
    textNode.text = name;
    if (textNode instanceof TtfTextSceneObject) {
      for (let i = name.length; i > 0; i--) {
        textNode.build();
        const calculatedWidth = textNode.calculateTextWidth(textNode.text);
        if (calculatedWidth === null || calculatedWidth <= textNode.size.x) {
          break;
        }
        textNode.text = name.substring(0, i) + '...';
      }
    }
  }

  static splitNameInTwo(name: string): string[] {
    name = name ?? '-';
    const index = name.indexOf(' ');
    if (index === -1) {
      return [name, ''];
    } else {
      return [
        name.substring(0, index),
        index < name.length - 1 ? name.substring(index + 1).trimLeft() : '',
      ];
    }
  }

  static getAbbreviatedName(fullName: string): string {
    const nameParts = fullName.split(' ').filter((x) => !StringUtils.isNullOrWhiteSpace(x));
    if (nameParts.length < 2) {
      return fullName;
    }
    return nameParts[0] + ' ' + nameParts[nameParts.length - 1][0] + '.';
  }
}
