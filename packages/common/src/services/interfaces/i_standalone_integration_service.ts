import { IUserSession } from './i_user_session';

export interface IStandaloneIntegrationService {
  isResetPassword: boolean;
  login(forceRegistration: boolean, loginMethodSelected: boolean): Promise<boolean>;
  registration(email: string, password: string): Promise<boolean>;
  logout(): Promise<void>;
  removeLoginView(): Promise<void>;
  relogin(): Promise<void>;
  reloginWithError(state: AuthState): Promise<boolean>;
  shareWithDialog(url: string): Promise<boolean>;
  getUserSession(): IUserSession;
  setSaSession(): void;
}

export enum AuthState {
  OK,
  INVALID_LOGIN_DETAILS,
  REGISTRATION_INVALID_PASSWORD,
  REGISTRATION_INVALID_EMAIL,
  REGISTRATION_EMAIL_IN_USE,
  UNKNOWN,
}
