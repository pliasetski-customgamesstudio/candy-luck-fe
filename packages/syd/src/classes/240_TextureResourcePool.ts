import { ResourcePool } from './90_ResourcePool';
import { TextureResource } from './174_TextureResource';
import { RenderDevice } from './244_RenderDevice';
import { TextureResourceDescription } from './139_TextureResourceDescription';
import { Texture } from './41_Texture';
import { Completer } from './0_Completer';
import { Compatibility } from './16_Compatibility';
import { EventStreamProvider } from './192_EventStreamProvider';
import { IMediaContainer } from './1_IMediaContainer';

export class TextureResourcePool extends ResourcePool<TextureResource> {
  private _renderDevice: RenderDevice;

  constructor(renderDevice: RenderDevice) {
    super();
    this._renderDevice = renderDevice;
  }

  public get requiresMediaContainer(): boolean {
    return false;
  }

  public async loadResourceData(
    resource: TextureResource,
    xml: HTMLElement,
    _: IMediaContainer | null
  ): Promise<void> {
    return this.loadResourceDataByDescription(resource, TextureResourceDescription.fromXml(xml));
  }

  async loadResourceDataByDescription(
    resource: TextureResource,
    description: TextureResourceDescription
  ): Promise<void> {
    resource.description = description;

    if (!resource.completer || resource.completer.isCompleted) {
      resource.completer = new Completer<Texture | null>();
    }

    if (description.textureSources.length === 1) {
      this._tryLoadImage(resource, description.textureSources[0].url, 3);
    } else {
      this._loadPicture(resource, description);
    }

    let data: Texture;
    try {
      data = (await resource.completer.promise)!;
    } catch (e) {
      this.unload(resource);
      throw e;
    }

    resource.construct(data);
  }

  public createResource(resoruceId: string): TextureResource {
    return new TextureResource(resoruceId);
  }

  private _loadPicture(resource: TextureResource, description: TextureResourceDescription): void {
    const picture = document.createElement('picture');

    for (let i = 1; i < description.textureSources.length; ++i) {
      const el = description.textureSources[i];

      const source = document.createElement('source');
      source.srcset = el.url;
      source.type = el.type!;
      picture.appendChild(source);
    }

    const defaultImage = description.textureSources[0];
    const url = defaultImage.url;

    const image = document.createElement('img');

    resource.loadSub = EventStreamProvider.subscribeElement(image, 'load', () => {
      resource.loadSub.cancel();
      resource.errorSub.cancel();

      const texture = this._renderDevice.createTextureFromImage(image);
      if (!texture && Compatibility.IsIE) {
        console.trace(
          `[TextureResourcePool] texture is null in _loadPicture, while loading texture '${url}'. retrying.`
        );
        resource.loadSub.cancel();
        resource.errorSub.cancel();
        this._tryLoadImage(resource, url, 3);
        return;
      }

      resource.completer.complete(texture);
    });

    resource.errorSub = EventStreamProvider.subscribeElement(image, 'error', () => {
      resource.loadSub.cancel();
      resource.errorSub.cancel();
      console.trace(`[TextureResourcePool] error, while loading texture '${url}'. retrying.`);
      this._tryLoadImage(resource, url, 3);
    });

    image.crossOrigin = '*';
    image.srcset = url;
    image.src = url;

    picture.appendChild(image);
  }

  private _tryLoadImage(resource: TextureResource, url: string, retryCount: number): void {
    const image = document.createElement('img');

    resource.loadSub = EventStreamProvider.subscribeElement(image, 'load', () => {
      resource.loadSub.cancel();
      resource.errorSub.cancel();
      const texture = this._renderDevice.createTextureFromImage(image);
      if (!texture && Compatibility.IsIE) {
        resource.loadSub.cancel();
        resource.errorSub.cancel();
        if (retryCount > 0) {
          console.trace(
            `[TextureResourcePool] texture is null in _tryLoadImage, while loading texture '${url}'. retrying.`
          );
          this._tryLoadImage(resource, url, retryCount - 1);
        } else {
          console.trace(
            `[TextureResourcePool] texture is null in _tryLoadImage, while loading texture '${url}'. retry attempts exceeded.`
          );
          resource.completer.complete(texture);
        }
        return;
      }
      resource.completer.complete(texture);
    });

    resource.errorSub = EventStreamProvider.subscribeElement(image, 'error', (e) => {
      resource.loadSub.cancel();
      resource.errorSub.cancel();
      if (retryCount > 0) {
        console.trace(`[TextureResourcePool] error, while loading texture '${url}'. retrying.`);
        this._tryLoadImage(resource, url, retryCount - 1);
      } else {
        resource.completer.completeError(e);
      }
    });

    image.crossOrigin = '*';
    image.src = url;
  }

  public contextLost(): void {
    for (const t of this.resources.values()) {
      t.destroy();

      t.loadSub?.cancel();
      t.errorSub?.cancel();
    }
  }

  public async contextReady(): Promise<void> {
    const loading = Array.from(this.resources.values()).map((t) =>
      this.loadResourceDataByDescription(t, t.description)
    );
    await Promise.all(loading);
  }
}
