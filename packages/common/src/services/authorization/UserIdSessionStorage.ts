import { SessionStorage } from '@cgs/shared';

const USER_ID_SESSION_STORAGE_KEY = 'USER_ID';

class UserIdSessionStorage {
  public getUserId(): string | null {
    return SessionStorage.getItem(USER_ID_SESSION_STORAGE_KEY) || null;
  }

  public setUserId(id: string | null): void {
    SessionStorage.setItem(USER_ID_SESSION_STORAGE_KEY, id || '');
  }

  public clearUserId(): void {
    SessionStorage.removeItem(USER_ID_SESSION_STORAGE_KEY);
  }
}

export const userIdSessionStorage = new UserIdSessionStorage();
