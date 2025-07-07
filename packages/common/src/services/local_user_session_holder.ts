import { IUserSession } from './interfaces/i_user_session';

export class UserSessionHolder implements IUserSession {
  email: string;
  password: string;
  socialToken: string;
  socialNetwork: string;
}
