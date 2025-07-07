import { AsyncOperationBase, T_RefreshExternalUserOperation } from '@cgs/common';
import { IOperationContext } from '@cgs/common';
import { T_LoginOperation } from '@cgs/features';

export class StartupOnlySlotOperation extends AsyncOperationBase {
  constructor(context: IOperationContext) {
    super(context);
  }

  async internalExecute(): Promise<void> {
    await this.context.startOperationByType(T_LoginOperation);

    this.context.viewContext.splashManager.step();

    this.context.viewContext.splashManager.step();

    // await Promise.all([this.context.startOperationByType(T_InitUserInfoOperation)]);

    this.context.startOperationByType(T_RefreshExternalUserOperation);

    this.context.viewContext.splashManager.step();

    return Promise.resolve();
  }
}
