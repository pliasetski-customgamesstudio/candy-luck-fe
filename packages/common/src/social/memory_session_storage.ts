import { ILocalSessionStorage } from '../services/interfaces/i_user_session';
import { UserSessionHolder } from '../services/local_user_session_holder';

export class MemorySessionStorage implements ILocalSessionStorage {
  static readonly accessKey: string = 'accesskey';
  static readonly emailLocal: string = 'identifier';
  static readonly passwordLocal: string = 'key';
  static readonly socialToken: string = 'socialTokenKey';
  static readonly socialNetwork: string = 'socialNetworkKey';

  storedValues: Map<string, string> = new Map<string, string>();

  saveLocal(session: UserSessionHolder): void {
    this.storedValues.set(MemorySessionStorage.emailLocal, session.email);
    this.storedValues.set(MemorySessionStorage.passwordLocal, session.password);
    this.storedValues.set(MemorySessionStorage.socialNetwork, session.socialNetwork);
    this.storedValues.set(MemorySessionStorage.socialToken, session.socialToken);
  }

  loadLocal(): UserSessionHolder | null {
    if (this.storedValues.has(MemorySessionStorage.emailLocal)) {
      const session: UserSessionHolder = new UserSessionHolder();
      session.email = this.storedValues.get(MemorySessionStorage.emailLocal) || '';
      session.password = this.storedValues.get(MemorySessionStorage.passwordLocal) || '';
      session.socialToken = this.storedValues.get(MemorySessionStorage.socialToken) || '';
      session.socialNetwork = this.storedValues.get(MemorySessionStorage.socialNetwork) || '';
      return session;
    }
    return null;
  }

  removeLocal(): void {
    this.storedValues = new Map<string, string>();
  }
}
