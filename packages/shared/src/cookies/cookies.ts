import JsCookies from 'js-cookie';
import { Logger } from '../utils/logger';

export class Cookies {
  private static _localStorageSupported: boolean | null = null;

  static isLocalStorageSupported(): boolean {
    if (Cookies._localStorageSupported === null) {
      const mod = 'modernizr';
      try {
        const localStorage = window.localStorage;
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        Logger.Info('LocalStorage supported');
        Cookies._localStorageSupported = true;

        const allCookies: Record<string, string> = JsCookies.get();
        for (const key in allCookies) {
          localStorage.setItem(key, allCookies[key]);
          JsCookies.remove(key);
        }
      } catch {
        Logger.Info('LocalStorage is not supported');
        Cookies._localStorageSupported = false;
      }
    }
    return Cookies._localStorageSupported;
  }

  static getAll(): Record<string, string> {
    if (Cookies.isLocalStorageSupported()) {
      const response: Record<string, string> = {};
      for (const key in window.localStorage) {
        response[key] = window.localStorage[key];
      }
      return response;
    } else {
      return JsCookies.get();
    }
  }

  static get(key: string): string | null {
    return Cookies.isLocalStorageSupported()
      ? window.localStorage.getItem(key)
      : JsCookies.get(key) || null;
  }

  static getJson(key: string): Record<string, any> | null {
    const isSupported = Cookies.isLocalStorageSupported();
    const data = isSupported ? window.localStorage.getItem(key) : JsCookies.get(key);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static set(key: string, value: string, expiresInDays: number = 7300): void {
    if (Cookies.isLocalStorageSupported()) {
      window.localStorage.setItem(key, value);
    } else {
      JsCookies.set(key, value, {
        expires: expiresInDays,
      });
    }
  }

  static setJson(key: string, value: Record<string, any>, expiresInDays: number = 7300): void {
    const val = JSON.stringify(value);
    if (Cookies.isLocalStorageSupported()) {
      window.localStorage.setItem(key, val);
    } else {
      JsCookies.set(key, val, {
        expires: expiresInDays,
      });
    }
  }

  static remove(key: string): void {
    if (Cookies.isLocalStorageSupported()) {
      window.localStorage.removeItem(key);
    } else {
      JsCookies.remove(key);
    }
  }
}
