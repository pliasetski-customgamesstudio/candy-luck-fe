import { Func0 } from '@cgs/shared';

export abstract class ISpinPauseProcessor {
  abstract get isUiBlocking(): boolean;
  abstract get isInterrupting(): boolean;
  abstract processSpinPause(): Promise<boolean>;
  abstract getPostProcessSpinPauseTask(
    willBlockSlotUi: boolean,
    willExitSlot: boolean
  ): Func0<Promise<void>>;
}

export function f_isISpinPauseProcessor(obj: any): obj is ISpinPauseProcessor {
  return (
    obj &&
    typeof obj.isUiBlocking === 'boolean' &&
    typeof obj.isInterrupting === 'boolean' &&
    typeof obj.processSpinPause === 'function' &&
    typeof obj.getPostProcessSpinPauseTask === 'function'
  );
}
