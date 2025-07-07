import { ISpinPauseProcessor } from './i_spin_pause_processor';

export abstract class ISpinPauseTaskResolutionStrategy<T extends ISpinPauseProcessor> {
  abstract addAndExecuteValidationTask(
    processSpinPause: T,
    willBlockSlotUi: boolean,
    willExitSlot: boolean
  ): Promise<void>;
  abstract addAndExecuteValidationTaskList(processSpinPauseTasks: T[]): Promise<void>;
  abstract executePostEventTasks(): Promise<void>;
}
