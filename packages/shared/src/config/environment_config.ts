export const enum EnvironmentName {
  CGS = 'cgs',
  Arkadium = 'arkadium',
}

export interface IEnvironmentConfig {
  name: EnvironmentName;
  api: {
    url: string;
    methods: {
      init: string;
      spin: string;
      bonus: string;
      userInfo?: string;
      refreshUserInfo?: string;
      buyCreditsWithGems?: string;
      buyCreditsWithAds?: string;
      watchAds?: string;
      getTaskCompletedCreditsWithAds?: string;
    };
  };
  useHTMLPayTable: boolean;
  showSessionInfo: boolean;
  maxInitTimeSDK?: number;
  simulateBuying?: boolean;
}

export class EnvironmentConfig {
  private static config: IEnvironmentConfig;

  public static init(config: IEnvironmentConfig): void {
    this.config = config;
  }

  public static get name(): EnvironmentName {
    return this.config.name as EnvironmentName;
  }

  public static get url(): string {
    return this.config.api.url;
  }

  public static get initMethodName(): string {
    return this.config.api.methods.init;
  }

  public static get spinMethodName(): string {
    return this.config.api.methods.spin;
  }

  public static get bonusMethodName(): string {
    return this.config.api.methods.bonus;
  }

  public static get userInfoMethodName(): string {
    return this.config.api.methods.userInfo || '';
  }

  public static get refreshUserInfoMethodName(): string {
    return this.config.api.methods.refreshUserInfo || '';
  }

  public static get buyCreditsWithGemsMethodName(): string {
    return this.config.api.methods.buyCreditsWithGems || '';
  }

  public static get buyCreditsWithAdsMethodName(): string {
    return this.config.api.methods.buyCreditsWithAds || '';
  }

  public static get getTaskCompletedCreditsWithAdsMethodName(): string {
    return this.config.api.methods.getTaskCompletedCreditsWithAds || '';
  }

  public static get watchAdsMethodName(): string {
    return this.config.api.methods.watchAds || '';
  }

  public static get useHTMLPayTable(): boolean {
    return this.config.useHTMLPayTable;
  }

  public static get showSessionInfo(): boolean {
    return this.config.showSessionInfo;
  }

  public static get maxInitTimeSDK(): number | null {
    return this.config.maxInitTimeSDK || null;
  }

  public static get simulateBuying(): boolean {
    return this.config.simulateBuying || false;
  }
}
