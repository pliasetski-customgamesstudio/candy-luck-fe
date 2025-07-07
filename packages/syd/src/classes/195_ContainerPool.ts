import { IMediaContainer } from './1_IMediaContainer';
import { MediaContainer } from './157_MediaContainer';

export class ContainerPool {
  static MaxChromeMediaLimit: number = 40;
  static ContainerPrefix: string = 'mediaContainer_';

  private _iframeList: Map<string, IMediaContainer> = new Map<string, IMediaContainer>();

  constructor() {}

  cleanUnusedIFramesForMedia(): void {
    try {
      if (!this._iframeList || this._iframeList.size === 0) return;
      const keys = Array.from(this._iframeList.keys());
      for (const iframeKey of keys) {
        if (!this._iframeList.has(iframeKey)) continue;
        const mediaContainer = this._iframeList.get(iframeKey);
        if (!mediaContainer) continue;
        if (!mediaContainer.isValidContainer() || mediaContainer.getCountOfMediaElements() <= 0) {
          mediaContainer.remove();
          this._iframeList.delete(iframeKey);
        }
      }
    } catch (err) {
      console.error('Not able to cleanup the unused iframes');
    }
  }

  getAvailableResourceContainerId(): string {
    if (this._iframeList.size == 0) {
      return this._containerNameGenerator(0);
    }
    for (const iframeKey of this._iframeList.keys()) {
      const iframe = this._iframeList.get(iframeKey);
      if (
        iframe &&
        iframe.isValidContainer() &&
        iframe.getCountOfMediaElements() < ContainerPool.MaxChromeMediaLimit - 1
      ) {
        return iframeKey;
      }
    }
    return this._containerNameGenerator(this._iframeList.size);
  }

  private _containerNameGenerator(index: number): string {
    const indexForContainer = index || 0;
    return ContainerPool.ContainerPrefix + indexForContainer.toString();
  }

  async getOrCreateContainer(containerId: string): Promise<IMediaContainer | null> {
    if (!this._iframeList || this._iframeList.size === 0) {
      return this._createMediaContainer(containerId);
    }
    if (!this._iframeList.has(containerId)) {
      return this._createMediaContainer(containerId);
    }
    return this._iframeList.get(containerId)!;
  }

  private async _createMediaContainer(containerId: string): Promise<IMediaContainer | null> {
    try {
      const id = containerId;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.id = id;

      const completer = new Promise<IMediaContainer>((resolve) => {
        const iframeLoadListener = () => {
          iframe.removeEventListener('load', iframeLoadListener);
          resolve(new MediaContainer(iframe));
        };
        iframe.addEventListener('load', iframeLoadListener);
      });
      document.body.append(iframe);

      const mediaContainer = await completer;
      this._iframeList.set(id, mediaContainer);
      return this._iframeList.get(id)!;
    } catch (err) {
      console.error('Error during iframe creation for video. Error: ' + err);
    }
    return Promise.resolve(null);
  }
}
