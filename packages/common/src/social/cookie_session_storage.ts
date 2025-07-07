import { UserSessionHolder } from '../services/local_user_session_holder';
import { ILocalSessionStorage } from '../services/interfaces/i_user_session';
import { Cookies } from '@cgs/shared';

export class CookieSessionStorage implements ILocalSessionStorage {
  static readonly accessKey: string = 'accesskey';
  static readonly emailLocal: string = 'identifier';
  static readonly passwordLocal: string = 'key';
  static readonly socialToken: string = 'socialTokenKey';
  static readonly socialNetwork: string = 'socialNetworkKey';
  static readonly sessionJsonKey: string = 'cookieSession';

  storedValues: Map<string, string> = new Map<string, string>();

  saveLocal(session: UserSessionHolder): void {
    const json: Map<string, string> = new Map<string, string>();

    json.set(CookieSessionStorage.emailLocal, session.email);
    json.set(CookieSessionStorage.passwordLocal, session.password);
    json.set(CookieSessionStorage.socialNetwork, session.socialNetwork);
    json.set(CookieSessionStorage.socialToken, session.socialToken);
    Cookies.setJson(CookieSessionStorage.sessionJsonKey, json);

    // use memory if cookies doesn't work
    this.storedValues.set(CookieSessionStorage.emailLocal, session.email);
    this.storedValues.set(CookieSessionStorage.passwordLocal, session.password);
    this.storedValues.set(CookieSessionStorage.socialNetwork, session.socialNetwork);
    this.storedValues.set(CookieSessionStorage.socialToken, session.socialToken);
  }

  loadLocal(): UserSessionHolder | null {
    const json: Record<string, string> = Cookies.getJson(
      CookieSessionStorage.sessionJsonKey
    ) as Record<string, string>;
    if (
      json &&
      (json[CookieSessionStorage.emailLocal] ||
        json[CookieSessionStorage.emailLocal] === 'facebook')
    ) {
      const session: UserSessionHolder = new UserSessionHolder();
      // session.email =
      //   json.get(CookieSessionStorage.emailLocal) != 'facebook'
      //     ? json.get(CookieSessionStorage.emailLocal)
      //     : null;
      session.password = json[CookieSessionStorage.passwordLocal] as string;
      session.socialToken = json[CookieSessionStorage.socialToken] as string;
      session.socialNetwork = json[CookieSessionStorage.socialNetwork] as string;
      return session;
    } else if (
      this.storedValues &&
      (this.storedValues.get(CookieSessionStorage.emailLocal) ||
        this.storedValues.get(CookieSessionStorage.emailLocal) === 'facebook')
    ) {
      const session: UserSessionHolder = new UserSessionHolder();
      // session.email =
      //   this.storedValues.get(CookieSessionStorage.emailLocal) != 'facebook'
      //     ? this.storedValues.get(CookieSessionStorage.emailLocal)
      //     : null;
      session.password = this.storedValues.get(CookieSessionStorage.passwordLocal) as string;
      session.socialToken = this.storedValues.get(CookieSessionStorage.socialToken) as string;
      session.socialNetwork = this.storedValues.get(CookieSessionStorage.socialNetwork) as string;
      return session;
    }
    return null;
  }

  removeLocal(): void {
    Cookies.remove(CookieSessionStorage.sessionJsonKey);
  }
}
