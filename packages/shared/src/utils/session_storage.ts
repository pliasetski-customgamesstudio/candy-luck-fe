export class SessionStorage {
  public static setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  public static getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  public static removeItem(key: string): void {
    return sessionStorage.removeItem(key);
  }
}
