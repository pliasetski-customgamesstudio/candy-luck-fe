import { IAuthorizationHolder } from './i_authorization_holder';
import { ISessionHolder } from './i_session_holder';
import { userIdSessionStorage } from './UserIdSessionStorage';

export class SlotOnlyAuthorizationHolder implements IAuthorizationHolder, ISessionHolder {
  private _session: string;
  private _userId: string | null;
  private _externalUserId: string | null;

  get userId(): string | null {
    return this._userId;
  }

  set userId(id: string | null) {
    // TODO: ARKADIUM: need proper place for this
    if (id !== this._userId) {
      userIdSessionStorage.setUserId(id || null);
    }

    this._userId = id;
  }

  get session(): string {
    return this._session;
  }

  get sessionToken(): string {
    return this._session;
  }

  get externalUserId(): string | null {
    return this._externalUserId;
  }

  setAuthorization(session: string, externalUserId: string | null): void {
    this._session = session;

    // TODO: ARKADIUM: need proper place for this
    this._userId = userIdSessionStorage.getUserId();

    this._externalUserId = externalUserId;
  }
}
