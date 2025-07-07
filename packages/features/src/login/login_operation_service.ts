import { ILoginOperationService } from './i_login_operation_service';
import { IAuthorizationHolder } from '@cgs/common';
import { ApplicationUserConfig, ArkadiumSdk } from '@cgs/shared';

export class LoginOperationService implements ILoginOperationService {
  private _authorizationHolder: IAuthorizationHolder;

  constructor(_authorizationHolder: IAuthorizationHolder) {
    this._authorizationHolder = _authorizationHolder;
  }

  async authorize(): Promise<void> {
    const session = ApplicationUserConfig.session;
    const externalUserId = await ArkadiumSdk.getInstance().getUserProfileId();
    this._authorizationHolder.setAuthorization(session, externalUserId);
  }
}
