import { EventDispatcher, EventStream, Platform } from '@cgs/syd';
import { ISettingsSection } from '../../settings/i_settings_section';
import { ISettingsManager } from '../../settings/i_serttings_manager';
import { SettingsExtensions } from '../../utils/settings_extensions';

export const T_IAppSettings = Symbol('IAppSettings');
export interface IAppSettings {
  init(): void;

  sounds: number;
  notifications: boolean;
  sharing: boolean;
  jackpot: boolean;
  get settingsChanged(): EventStream<void>;
}

export class AppSettings implements IAppSettings {
  private _platform: Platform;
  private readonly SettingsKey = 'Settings';
  private readonly NotificationsKey = 'notifications';
  private readonly SoundsKey = 'sounds';
  private readonly SharingKey = 'sharing';
  private readonly JackpotKey = 'jackpot';

  private _sounds = 0.5;
  private _notifications = true;
  private _sharing = true;
  private _jackpot = true;

  private _settingsChangedDispatcher = new EventDispatcher<void>();
  get settingsChanged(): EventStream<void> {
    return this._settingsChangedDispatcher.eventStream;
  }

  private _settingsSection: ISettingsSection;

  constructor(settingsManager: ISettingsManager, platform: Platform) {
    this._settingsSection = settingsManager.getMainSection(this.SettingsKey);
    this._platform = platform;
  }

  init(): void {
    this.setSound(this.sounds);
  }

  private setSound(value: number): void {
    this._platform.audioSystem.audioDevice.globalVolume = Math.min(Math.max(value, 0), 1);
  }

  private getSetting(settingKey: string, defaultValue: any): any {
    return this._settingsSection.keyExists(settingKey)
      ? SettingsExtensions.getSafe(this._settingsSection, settingKey, defaultValue)
      : defaultValue;
  }

  get notifications(): boolean {
    if (this.isCookieSupported()) {
      return this.getSetting(this.NotificationsKey, true);
    }

    return this._notifications;
  }

  get sounds(): number {
    if (this.isCookieSupported()) {
      return this.getSetting(this.SoundsKey, 0.5);
    }

    return this._sounds;
  }

  set sounds(value: number) {
    if (this.isCookieSupported()) {
      this._settingsSection.set(this.SoundsKey, value);
    } else {
      this._sounds = value;
    }

    this.setSound(value);
    this._settingsChangedDispatcher.dispatchEvent();
  }

  get sharing(): boolean {
    if (this.isCookieSupported()) {
      return this.getSetting(this.SharingKey, true);
    }

    return this._sharing;
  }

  set sharing(value: boolean) {
    if (this.isCookieSupported()) {
      this._settingsSection.set(this.SharingKey, value);
    } else {
      this._sharing = value;
    }

    this._settingsChangedDispatcher.dispatchEvent();
  }

  get jackpot(): boolean {
    if (this.isCookieSupported()) {
      return this.getSetting(this.JackpotKey, true);
    }

    return this._jackpot;
  }

  set jackpot(value: boolean) {
    if (this.isCookieSupported()) {
      this._settingsSection.set(this.JackpotKey, value);
    } else {
      this._jackpot = value;
    }

    this._settingsChangedDispatcher.dispatchEvent();
  }

  set notifications(value: boolean) {
    if (this.isCookieSupported()) {
      this._settingsSection.set(this.NotificationsKey, value);
    } else {
      this._notifications = value;
    }
    this._settingsChangedDispatcher.dispatchEvent();
  }

  private isCookieSupported(): boolean {
    const dummyName = 'COOKIE_IS_WORKED';
    this._settingsSection.set(dummyName, true);
    return this.getSetting(dummyName, false);
  }
}
