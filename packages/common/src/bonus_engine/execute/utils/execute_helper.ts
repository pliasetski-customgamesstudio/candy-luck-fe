import {
  ActionActivator,
  Completer,
  InterpolateCopyAction,
  lerp,
  Log,
  SceneObject,
} from '@cgs/syd';
import { VoidFunc1 } from '@cgs/shared';
import { SceneExtensions } from '../../utils/scene_extensions';
import { NumberFormatter } from '../../../utils/number_formatter';

export class ExecuteHelper {
  static readonly RootSceneId: string = 'root';

  static GetElement(root: SceneObject, elementId: string): SceneObject | null {
    let result: SceneObject | null =
      elementId === ExecuteHelper.RootSceneId
        ? root
        : SceneExtensions.FindByUniqueId(root, elementId);
    if (!result) {
      if (root.id === elementId) {
        result = root;
      }
    }
    return result;
  }

  static GetAllElements(root: SceneObject, elementId: string): SceneObject[] {
    const list: SceneObject[] = [];

    if (elementId === ExecuteHelper.RootSceneId) {
      list.push(root);
    } else {
      list.push(...SceneExtensions.FindAllByUniqueId(root, elementId));
    }
    return list;
  }

  static GetElementFromList(roots: SceneObject[], elementId: string): SceneObject | null {
    for (const root of roots) {
      let result = SceneExtensions.FindByUniqueId(root, elementId);
      if (!result) {
        if (root.id === elementId) {
          result = root;
        }
      }
      if (result) {
        return result;
      }
    }
    return null;
  }

  static GetAllElementsFromList(roots: SceneObject[], elementId: string): SceneObject[] {
    const list: SceneObject[] = [];
    for (const root of roots) {
      list.push(...SceneExtensions.FindAllByUniqueId(root, elementId));
    }
    return list;
  }

  static async playInterpolateAction(
    host: SceneObject,
    func: VoidFunc1<number | undefined>,
    duration: number,
    startValue: number,
    endValue: number
  ): Promise<void> {
    const completer = new Completer<void>();

    const interpolateAction = new InterpolateCopyAction<number>()
      .withDuration(duration)
      .withValues(startValue, endValue)
      .withInterpolateFunction(lerp);

    const activator = ActionActivator.withAction(host, interpolateAction);
    interpolateAction.valueChange.listen(func);
    interpolateAction.done.listen(() => {
      activator.end();
      completer.complete();
    });

    activator.start();

    return completer.promise;
  }

  static tryParse(value: string): number {
    return Number(
      value
        .replaceAll(',', '')
        .replaceAll('K', '000')
        .replaceAll('M', '000000')
        .replaceAll('B', '000000000')
        .replaceAll('t', '000000000000')
        .replaceAll('q', '000000000000000')
        .replaceAll('Q', '000000000000000000')
        .replaceAll('s', '000000000000000000000')
        .replaceAll('S', '000000000000000000000000')
    );
  }

  static tryParseDouble(value: string): number {
    return Number(
      value
        .replaceAll(',', '')
        .replaceAll('K', '000')
        .replaceAll('M', '000000')
        .replaceAll('B', '000000000')
        .replaceAll('t', '000000000000')
        .replaceAll('q', '000000000000000')
        .replaceAll('Q', '000000000000000000')
        .replaceAll('s', '000000000000000000000')
        .replaceAll('S', '000000000000000000000000')
    );
  }

  static format(value: number, format: string): string {
    if (!format) {
      Log.Warning('Format must contain at least two symbols ${format}');
    }
    const formatType = format[0];
    let precision: number = parseInt(format.substring(1), 10);
    if (isNaN(precision)) {
      precision = 9;
    }
    switch (formatType) {
      case 'K':
        return NumberFormatter.formatWinLong(value, precision);
      case 'Z':
        return NumberFormatter.formatValueShortDownBonus(value, precision, false, true);
      case 'T':
        return NumberFormatter.formatValueShortDownBonus(value, precision, false, false);
    }
    return NumberFormatter.format(value, 2);
  }
}
