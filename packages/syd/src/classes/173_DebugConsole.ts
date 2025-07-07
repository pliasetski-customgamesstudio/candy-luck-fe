import { KeyBinding, KeyBindingFunction } from './80_KeyBinding';
import { DebugUtils } from './96_DebugUtils';

export class DebugConsole {
  private static _messages: string[] = [];
  private static _cont: HTMLDivElement | null = null;
  private static _target: HTMLDivElement | null = null;
  private static _slientCrashOverlay: HTMLDivElement | null = null;

  private static countOfCrashes: number = 0;

  private static _isEnabled: boolean = false;

  public static get IsEnabled(): boolean {
    return DebugConsole._isEnabled;
  }

  private static _bindings: Map<number, KeyBinding> = new Map<number, KeyBinding>();

  public static Bind(
    keyCode: number,
    keyName: string,
    description: string,
    binding: KeyBindingFunction
  ): void {
    DebugConsole._bindings.set(keyCode, new KeyBinding(keyName, description, binding));
  }

  public static Initialize(canvas: HTMLCanvasElement): void {
    if (!DebugConsole._cont) {
      DebugConsole._cont = document.createElement('div');
      DebugConsole._cont.style.width = canvas.width.toString() + 'px';
      DebugConsole._cont.style.position = 'absolute';
      DebugConsole._cont.style.display = 'none';
      DebugConsole._cont.style.border = '1px solid #eee';
      DebugConsole._cont.style.backgroundColor = 'rgba(238, 238, 238, 0.3)';
      DebugConsole._cont.style.top = '0';

      DebugConsole._target = document.createElement('div');
      DebugConsole._target.style.marginTop = '10px';
      DebugConsole._target.style.opacity = '1';

      const txt = document.createElement('div');
      txt.textContent =
        'Support keys: [~] [1 - Sizes] [2 - Touch Areas] [4 - Bounds] [5 - Reset Client Crash Counter]';

      DebugConsole._cont.appendChild(txt);
      DebugConsole._cont.appendChild(DebugConsole._target);

      document.body.appendChild(DebugConsole._cont);
    }
  }

  public static Enable(): void {
    DebugConsole._isEnabled = !DebugConsole._isEnabled;
    DebugConsole._cont!.style.display = DebugConsole._isEnabled ? 'block' : 'none';
  }

  private static ResetSlientCrashOverlayIfRequired(): void {
    if (DebugUtils.resetCrashCounter) {
      DebugConsole.countOfCrashes = 0;
      if (DebugConsole._slientCrashOverlay !== null) {
        document.body.removeChild(DebugConsole._slientCrashOverlay);
      }
      DebugUtils.resetCrashCounter = false;
    }
  }

  /**
   * Add slient crash overlay - to notify developers and testers about issues in our app
   * It will color the game view in RED color - so everybody will know that something is going wrong
   */
  private static InitSlientCrashOverlayIfRequired(): void {
    DebugConsole.ResetSlientCrashOverlayIfRequired();

    if (DebugConsole.countOfCrashes < 1) return;
    if (!DebugConsole._slientCrashOverlay) {
      DebugConsole._slientCrashOverlay = document.createElement('div');
      DebugConsole._slientCrashOverlay.style.width = '100vw';
      DebugConsole._slientCrashOverlay.style.height = '100vh';
      DebugConsole._slientCrashOverlay.style.position = 'absolute';
      DebugConsole._slientCrashOverlay.style.display = 'block';
      DebugConsole._slientCrashOverlay.style.backgroundColor = 'rgba(255, 51, 51, 0.20)';
      DebugConsole._slientCrashOverlay.style.pointerEvents = 'none';
      DebugConsole._slientCrashOverlay.style.top = '0';
      document.body.appendChild(DebugConsole._slientCrashOverlay);
    }
  }

  /**
   *  Add message for drawing
   */
  public static Print(message: string): void {
    if (!DebugConsole._isEnabled) {
      return;
    }

    DebugConsole._messages.push(message);
  }

  public static Draw(): void {
    DebugConsole.InitSlientCrashOverlayIfRequired();

    if (!DebugConsole._isEnabled) {
      return;
    }

    let data: string = '';

    for (let i = 0; i < DebugConsole._messages.length; i++) {
      data += DebugConsole._messages[i] + '<br>';
    }

    DebugConsole._target!.innerHTML = data;
    DebugConsole._messages = [];
  }
}
