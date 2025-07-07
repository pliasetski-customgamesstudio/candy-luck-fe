import { IRefreshSupport } from './i_refresh_support';
import { EventStream, Tuple3 } from '@cgs/syd';

export class ClientConfigPropertyDTO {
  isDefault: boolean;
  key: string;
  type: string;
  value: string;
}

export const T_IClientProperties = Symbol('IClientProperties');
export interface IClientProperties extends IRefreshSupport {
  updateProperties(properties: ClientConfigPropertyDTO[], shouldRemove?: boolean): void;

  propertyChanged: EventStream<Tuple3<string, string, string>>;

  propertiesUpdated: EventStream<any>;

  [key: string]: any;

  get(key: string, defOrType?: any): any;

  // getConv(key: string, type?: Type, def?: any): any;

  keyExists(key: string): boolean;

  setLocal(key: string, value: any): void;

  isFeatureEnabled(key: string, def?: boolean): boolean;

  getBackTracking(keys: string[], defOrType?: any): any;
}

export class RequestParam {
  static Timeout: string = 'requestParam.timeout';
  static ServerErrorRetrying: string = 'requestParam.serverErrorRetrying';
  static NoInternetRetrying: string = 'requestParam.noInternetRetrying';
}

export class PropertiesRequestStatistics {
  static Enabled: string = 'requestStatistics.enabled';
  static TimeRate: string = 'requestStatistics.timeRate';
}

export class SpinAccelerationMultiplier {
  static enabled: string = 'features.spinAccelerationMultiplier.enabled';
  static enabledPerSlot: string = 'features.spinAccelerationMultiplier.enabledPerSlot';
}
