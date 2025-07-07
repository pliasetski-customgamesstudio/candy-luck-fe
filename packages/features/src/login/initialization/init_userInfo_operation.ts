import { AsyncOperationBase } from '@cgs/common';
import { IBalanceRefreshService } from '@cgs/common';
import { IOperationContext } from '@cgs/common';

export class InitUserInfoOperation extends AsyncOperationBase {
  private _balanceRefreshService: IBalanceRefreshService;

  constructor(context: IOperationContext, balanceRefreshService: IBalanceRefreshService) {
    super(context);
    this._balanceRefreshService = balanceRefreshService;
  }

  async internalExecute(): Promise<void> {
    await this._balanceRefreshService.refreshBalance();
  }

  get batchCommandName(): string {
    return 'user.getUserInfo';
  }
}
