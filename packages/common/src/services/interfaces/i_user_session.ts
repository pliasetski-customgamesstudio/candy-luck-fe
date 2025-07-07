import { UserSessionHolder } from '../local_user_session_holder';

export interface IUserSession {
  email: string;
  socialToken: string;
  socialNetwork: string;
}

export interface ILocalSessionStorage {
  saveLocal(session: UserSessionHolder): void;
  loadLocal(): UserSessionHolder | null;
  removeLocal(): void;
}
