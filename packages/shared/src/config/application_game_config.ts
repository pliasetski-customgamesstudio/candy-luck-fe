interface IApplicationGameConfig {
  currency?: string;
  gameId?: string;
  machineId?: string;
  appVersion?: string;
  params?: Record<string, string | number>;
}

type ParamValue = string | number;

export class ApplicationGameConfig {
  private static config: IApplicationGameConfig = {};

  public static init(config: IApplicationGameConfig): void {
    this.config = config;
  }

  public static get currency(): string {
    return this.config.currency || '';
  }

  public static get gameId(): string {
    return this.config.gameId || '';
  }

  public static get machineId(): string {
    return this.config.machineId || '1';
  }

  public static get versionCode(): string {
    return 'DEFAULT_VERSION';
  }

  public static get appVersion(): string {
    return this.config.appVersion || '';
  }

  public static get params(): Record<string, ParamValue> {
    return this.config.params || {};
  }

  public static getParam<T = ParamValue>(key: string): T {
    return this.params[key] as T;
  }

  public static setParam(key: string, value: ParamValue): void {
    if (!this.config.params) {
      this.config.params = {};
    }
    this.config.params[key] = value;
  }
}
