export interface ILocaleSettings {
  currentLocale: string;
  saveCurrentLocale(locale: string): void;
}

export class LocaleSettings implements ILocaleSettings {
  static readonly LOCALE_EN: string = 'en';
  static readonly LOCALE_RU: string = 'ru';
  static readonly LOCALE_JP: string = 'jp';
  static readonly LOCALE_PT: string = 'pt';
  static readonly LOCALE_TR: string = 'TR';

  currentLocale: string = LocaleSettings.LOCALE_EN;

  saveCurrentLocale(locale: string): void {
    this.currentLocale = locale;
  }
}
