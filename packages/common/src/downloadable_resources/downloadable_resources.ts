import { EventDispatcher, EventStream } from '@cgs/syd';
import { StringUtils } from '@cgs/shared';

export class DownloadResource {
  path: string;
  uri: string;
}

export class DownloadableBundle {
  bundleName: string;
  resources: DownloadResource[] = [];
}

export const T_IDownloadableResourceManager = Symbol('IDownloadableResourceManager');
export interface IDownloadableResourceManager {
  isBundleReady(bundleName: string): boolean;
  initialize(): void;
  waitForBundle(bundleName: string): Promise<void>;
  bundles: DownloadableBundle[];
  bundleReady: EventStream<string>;
}

export class StubDownloadableResourceManager implements IDownloadableResourceManager {
  isBundleReady(_bundleName: string): boolean {
    return true;
  }
  initialize(): void {}
  waitForBundle(_bundleName: string): Promise<void> {
    return Promise.resolve();
  }
  bundles: DownloadableBundle[] = [];
  private _fakeDispatcher: EventDispatcher<string> = new EventDispatcher<string>();
  get bundleReady(): EventStream<string> {
    return this._fakeDispatcher.eventStream;
  }
}

export class WaitDownloadableResourcesOperation {
  static shouldDownloadPropertyName(bundleName: string): string {
    return StringUtils.format(DownloadableResourcesConstantsClientProperties.ShouldDownloadFormat, [
      bundleName,
    ]);
  }
}

export class DownloadableResourcesConstantsClientProperties {
  static readonly DelayOnFirstSession: string = 'downloadableResources.delayOnFirstSession';
  static readonly PreferredBundles: string = 'downloadableResources.preferredBundles';
  static readonly ShouldDownloadFormat: string = 'downloadableResources.shouldDownload.{0}';
}
