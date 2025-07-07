interface IApplicationUserConfig {
  session?: string;
  cheatUser?: boolean;
  language?: string;
}

const AVAILABLE_LANGUAGES = [
  'en', // English (source)
  'cs', // Czech
  'nl', // Dutch
  'fi', // Finnish
  'fr', // French
  'de', // German
  'it', // Italian
  'no', // Norwegian
  'pt', // Portuguese
  'sv', // Swedish
  'es', // Spanish
];
const DEFAULT_LANGUAGE = 'en';

export class ApplicationUserConfig {
  private static config: IApplicationUserConfig;

  public static init(config: IApplicationUserConfig = {}): void {
    this.config = config;
  }

  public static get language(): string {
    const lang = this.config.language || DEFAULT_LANGUAGE;
    return AVAILABLE_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  }

  public static get session(): string {
    return this.config.session || Math.floor(Math.random() * 1000000).toString();
  }

  public static get cheatUser(): boolean {
    return this.config.cheatUser || false;
  }
}
