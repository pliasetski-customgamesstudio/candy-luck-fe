import { Func0, ListUtil } from '@cgs/shared';
import { ISpinPauseProcessor } from './i_spin_pause_processor';
import { ISpinPauseTaskResolutionStrategy } from './i_spin_pause_task_resolution_strategy';

export class SpinPauseTaskResolutionStrategy<T extends ISpinPauseProcessor>
  implements ISpinPauseTaskResolutionStrategy<T>
{
  private _postEventNonBlockingTasks: Array<Func0<Promise<void>>> = [];
  private _postEventBlockingTasks: Array<Func0<Promise<void>>> = [];
  private _postEventInterruptingTasks: Array<Func0<Promise<void>>> = [];

  async addAndExecuteValidationTask(
    processSpinPause: T,
    willBlockSlotUi: boolean,
    willExitSlot: boolean
  ): Promise<void> {
    if (processSpinPause) {
      const postEventTasks = processSpinPause.getPostProcessSpinPauseTask(
        willBlockSlotUi,
        willExitSlot
      );
      if (postEventTasks) {
        if (processSpinPause.isInterrupting) {
          this._postEventInterruptingTasks.push(postEventTasks);
        } else if (processSpinPause.isUiBlocking) {
          this._postEventBlockingTasks.push(postEventTasks);
        } else {
          this._postEventNonBlockingTasks.push(postEventTasks);
        }
      }
    }
  }

  async addAndExecuteValidationTaskList(processSpinPauseTasks: Array<T>): Promise<void> {
    const shouldProcessSpinPause: Map<ISpinPauseProcessor, boolean> = new Map<
      ISpinPauseProcessor,
      boolean
    >();

    for (const processSpinPauseTask of processSpinPauseTasks) {
      shouldProcessSpinPause.set(
        processSpinPauseTask,
        await processSpinPauseTask.processSpinPause()
      );
    }

    for (const processSpinPauseTask of processSpinPauseTasks) {
      const process = shouldProcessSpinPause.get(processSpinPauseTask);
      if (process ?? false) {
        this.addAndExecuteValidationTask(
          processSpinPauseTask,
          ListUtil.any(processSpinPauseTasks, (t) => t.isUiBlocking),
          ListUtil.any(processSpinPauseTasks, (t) => t.isInterrupting)
        );
      }
    }
  }

  async executePostEventTasks(): Promise<void> {
    const firstUiBlockingTask =
      this._postEventBlockingTasks.length > 0 ? this._postEventBlockingTasks[0] : null;
    if (firstUiBlockingTask) {
      this._postEventNonBlockingTasks.push(firstUiBlockingTask);
    }
    await Promise.all(this._postEventNonBlockingTasks.map((operation) => operation()));
    this._postEventNonBlockingTasks = [];

    for (const task of this._postEventBlockingTasks.slice(1)) {
      await task();
    }
    this._postEventBlockingTasks = [];

    for (const task of this._postEventInterruptingTasks) {
      await task();
    }
    this._postEventInterruptingTasks = [];
  }
}
