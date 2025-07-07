import { IAuthorizationHolder } from '../authorization/i_authorization_holder';
import { IBrowser } from './i_browser';
import { IClientProperties } from './i_client_properties';
import { ISilentCrashReporter } from '../../crash_reporting/i_silent_crash_reporter';
import { BrowserHelper } from '../../utils/browser_helper';
import { ApplicationGameConfig } from '@cgs/shared';

export interface ICustomerSupport {
  open(): Promise<void>;
  substituteUserInfo(url: string): string;
}

export class CustomerSupport implements ICustomerSupport {
  private _authHolder: IAuthorizationHolder;
  private _browser: IBrowser;
  private _clientProperties: IClientProperties;
  private _silentCrashReporter: ISilentCrashReporter;

  constructor(
    authHolder: IAuthorizationHolder,
    browser: IBrowser,
    clientProperties: IClientProperties,
    silentCrashReporter: ISilentCrashReporter
  ) {
    this._authHolder = authHolder;
    this._browser = browser;
    this._clientProperties = clientProperties;
    this._silentCrashReporter = silentCrashReporter;
  }

  async open(): Promise<void> {}

  substituteUserInfo(url: string): string {
    // const authId = this._authHolder.authId || '';
    // const userId = this._authHolder.userId || '';
    // const authInfo = this._authHolder.getAutorizationResult();
    // const platformId = authInfo?.info?.platformId || '';

    const agent = BrowserHelper.parseUserAgent();
    // url = url.replace('{idfa}', encodeURIComponent(`${authId}`));
    // url = url.replace('{userId}', encodeURIComponent(`${userId}`));
    url = url.replace('{appVersion}', encodeURIComponent(ApplicationGameConfig.appVersion));
    url = url.replace('{deviceType}', encodeURIComponent(agent.get('device_type') || ''));
    url = url.replace('{osVersion}', encodeURIComponent(agent.get('os') || ''));
    url = url.replace('{platform}', encodeURIComponent(agent.get('browser') || ''));
    // url = url.replace('{platform_id}', encodeURIComponent(`${platformId}`));
    return url;
  }
}
