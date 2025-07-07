import { ApplicationGameConfig } from '@cgs/shared';

export class DeviceInfoEx {
  public static getAppVersion(): number {
    const strVer: string[] = ApplicationGameConfig.appVersion.split('.');
    let version = parseInt(strVer[0]) * 10000;
    version = strVer.length > 1 ? version + parseInt(strVer[1]) * 100 : version;
    version = strVer.length > 2 ? version + parseInt(strVer[2]) : version;

    return version;
  }
}
