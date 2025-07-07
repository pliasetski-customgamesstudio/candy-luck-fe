import { AsyncOperationBase, IOperationContext } from '@cgs/common';
import { ILoginOperationService } from './i_login_operation_service';

export const T_LoginOperation = Symbol('LoginOperation');

export class LoginOperation extends AsyncOperationBase {
  private _loginOperationService: ILoginOperationService;

  constructor(context: IOperationContext, loginOperationService: ILoginOperationService) {
    super(context);
    this._loginOperationService = loginOperationService;
  }

  protected async internalExecute(): Promise<void> {
    await this._loginOperationService.authorize();
  }
}
