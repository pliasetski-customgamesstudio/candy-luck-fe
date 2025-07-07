import { DeviceAuthorizationInfo } from '@cgs/network';

export interface IDeviceInfoProvider {
  getDeviceInfo(): Promise<DeviceAuthorizationInfo>;
  get currentTimeZone(): string;
  get resPlatform(): string;
}
