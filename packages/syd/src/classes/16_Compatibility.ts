export class Compatibility {
  private static _IsIE: boolean | null = null;
  private static _IsSafari: boolean | null = null;
  private static _IsChrome: boolean | null = null;
  private static _IsFirefox5: boolean | null = null;
  private static _IsMobileBrowser: boolean | null = null;
  private static _IsLowBatteryMod: boolean = false;

  public static get IsLowBatteryMod(): boolean {
    return Compatibility._IsLowBatteryMod;
  }

  public static IsLowBatteryModActivated(activated: boolean): void {
    Compatibility._IsLowBatteryMod = activated;
  }

  public static get IsIE(): boolean {
    if (Compatibility._IsIE === null) {
      const version = window.navigator.appVersion;
      Compatibility._IsIE =
        window.navigator.appName.includes('Microsoft') ||
        version.includes('Trident') ||
        version.includes('Edge');
    }

    return Compatibility._IsIE;
  }

  public static get IsChrome(): boolean {
    if (Compatibility._IsChrome === null) {
      Compatibility._IsChrome = window.navigator.userAgent.includes('Chrome');
    }

    return Compatibility._IsChrome;
  }

  public static get IsSafari(): boolean {
    if (Compatibility._IsSafari === null) {
      const userAgent = window.navigator.userAgent;
      Compatibility._IsSafari = userAgent.includes('Safari') && !userAgent.includes('CriOS');
    }

    return Compatibility._IsSafari;
  }

  public static get IsFirefox5(): boolean {
    if (Compatibility._IsFirefox5 === null) {
      const agent = window.navigator.userAgent.toLowerCase();
      Compatibility._IsFirefox5 = agent.includes('firefox/5');
    }

    return Compatibility._IsFirefox5;
  }

  public static get IsMobileBrowser(): boolean {
    return true;

    // if (Compatibility._IsMobileBrowser === null) {
    //   const userAgent = window.navigator.userAgent;
    //   Compatibility._IsMobileBrowser =
    //     userAgent.includes('Android') ||
    //     userAgent.includes('webOS') ||
    //     userAgent.includes('iPhone') ||
    //     userAgent.includes('iPad') ||
    //     userAgent.includes('iPod') ||
    //     userAgent.includes('BlackBerry') ||
    //     userAgent.includes('IEMobile') ||
    //     userAgent.includes('Opera Mini');
    // }
    //
    // return Compatibility._IsMobileBrowser;
  }

  public static get IsRealMobileBrowser(): boolean {
    if (Compatibility._IsMobileBrowser === null) {
      const userAgent = window.navigator.userAgent;
      Compatibility._IsMobileBrowser =
        userAgent.includes('Android') ||
        userAgent.includes('webOS') ||
        userAgent.includes('iPhone') ||
        userAgent.includes('iPad') ||
        userAgent.includes('iPod') ||
        userAgent.includes('BlackBerry') ||
        userAgent.includes('IEMobile') ||
        userAgent.includes('Opera Mini');
    }

    return Compatibility._IsMobileBrowser;
  }

  public static get isPortrait(): boolean {
    return window.innerWidth < window.innerHeight && this.IsMobileBrowser;
  }
}
