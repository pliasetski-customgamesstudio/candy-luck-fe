import { Key } from 'ts-keycode-enum';
import { DebugConsole } from './173_DebugConsole';

export class DebugUtils {
  private static _drawSizes: boolean = false;
  private static _drawTouchAreas: boolean = false;
  private static _drawBounds: boolean = false;

  public static get DrawSizes(): boolean {
    return DebugUtils._drawSizes;
  }

  public static get DrawTouchAreas(): boolean {
    return DebugUtils._drawTouchAreas;
  }

  public static get DrawBounds(): boolean {
    return DebugUtils._drawBounds;
  }

  public static resetCrashCounter: boolean = false;

  public static Initialize(): void {
    DebugConsole.Bind(Key.One, '1', 'toggle size drawing', () => {
      DebugUtils._drawSizes = !DebugUtils._drawSizes;
    });
    DebugConsole.Bind(Key.Two, '2', 'toggle touch areas drawing', () => {
      DebugUtils._drawTouchAreas = !DebugUtils._drawTouchAreas;
    });
    DebugConsole.Bind(Key.Four, '4', 'toggle bounds drawing', () => {
      DebugUtils._drawBounds = !DebugUtils._drawBounds;
    });
    DebugConsole.Bind(Key.Five, '5', 'reset slient crash counter', () => {
      DebugUtils.resetCrashCounter = true;
    });
  }

  public static InitializeLoseContext(jsObject: any): void {
    DebugConsole.Bind(Key.Delete, 'DELETE', 'lose webgl context', () => {
      jsObject.loseContext();
    });
    DebugConsole.Bind(Key.Insert, 'INSERT', 'restore webgl context', () => {
      jsObject.restoreContext();
    });
  }
}
