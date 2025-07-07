import { SyncOperationBase } from '@cgs/common';
import { IOperationContext } from '@cgs/common';
import { RefreshExternalUserService } from '../refresh_external_user_service';

export class RefreshExternalUserOperation extends SyncOperationBase {
  constructor(
    context: IOperationContext,
    private refreshExternalUserService: RefreshExternalUserService
  ) {
    super(context);
  }

  public internalExecute(): void {
    this.refreshExternalUserService.handleUserRefresh();
  }
}
