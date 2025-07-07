import { IUserSafeUpdateListener } from './i_user_safe_update_listener';

export interface IUserUpdateWatcher {
  registerListener(listener: IUserSafeUpdateListener): void;
  unregisterListener(listener: IUserSafeUpdateListener): void;
}
