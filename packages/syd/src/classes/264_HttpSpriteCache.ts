import { RenderDevice } from './244_RenderDevice';
import { HttpSpriteResource } from './168_HttpSpriteResource';
import { HttpSpriteResourceEntry } from './114_HttpSpriteResourceEntry';
import { EventStreamProvider } from './192_EventStreamProvider';
import { SpriteFrame } from './151_SpriteFrame';
import { Vector2 } from './15_Vector2';
import { SpriteData } from './162_SpriteData';
import { Rect } from './112_Rect';
import { TextureResource } from './174_TextureResource';

export class HttpSpriteCache {
  private _renderDevice: RenderDevice;
  private _map: Map<string, HttpSpriteResource> = new Map<string, HttpSpriteResource>();
  private _queue: Map<HttpSpriteResource, HttpSpriteResourceEntry> = new Map<
    HttpSpriteResource,
    HttpSpriteResourceEntry
  >();
  private _contextLost: boolean = false;
  private _current: HttpSpriteResource | null = null;

  constructor(renderDevice: RenderDevice) {
    this._renderDevice = renderDevice;
    this._renderDevice.lost.listen(() => this._onDeviceLost());
    this._renderDevice.ready.listen(() => this._onDeviceReady());
  }

  request(uri: string): HttpSpriteResource {
    let result = this._map.get(uri);
    if (result) {
      return result;
    }

    result = new HttpSpriteResource(uri);
    this._map.set(uri, result);

    this._queue.set(result, new HttpSpriteResourceEntry(result));

    if (!this._current) {
      this._processQueue();
    }

    return result;
  }

  setPriority(resource: HttpSpriteResource, priority: number): void {
    const entry = this._queue.get(resource);
    if (entry) {
      entry.priority = priority;
    }
  }

  private _continue(): void {
    this._current = null;
    this._processQueue();
  }

  private _processQueue(): void {
    if (this._queue.size > 0) {
      // let max: HttpSpriteResourceEntry;

      let entry = this._queue.values().next().value!;
      const values = this._queue.values();

      for (const e of values) {
        if (e.priority > entry.priority) {
          entry = e;
        }
      }

      this._queue.delete(entry.resource);

      if (entry.resource) {
        this._current = entry.resource;
        this._download(entry.resource);
      } else {
        this._continue();
      }
    }
  }

  private _download(resource: HttpSpriteResource): void {
    const image = new Image();
    image.crossOrigin = '*';
    image.src = resource.id;
    resource.image = image;

    this._load(resource);
  }

  private _construct(resource: HttpSpriteResource): void {
    const frames: SpriteFrame[] = new Array<SpriteFrame>(1);
    const textureResource = new TextureResource(resource.id);

    const texture = resource.image
      ? this._renderDevice.createTextureFromImage(resource.image)
      : null;

    if (texture && resource.image) {
      textureResource.construct(texture);
      const size = new Vector2(resource.image.width, resource.image.height);
      frames[0] = new SpriteFrame(Rect.fromSize(Vector2.Zero, size), Vector2.Zero, size);

      const data = new SpriteData(textureResource, frames);
      resource.complete(data);
    } else {
      resource.completeError('invalid image data');
    }
  }

  private _load(resource: HttpSpriteResource): void {
    if (resource.image?.complete) {
      this._construct(resource);
      this._continue();
    } else {
      resource.loadSub = EventStreamProvider.subscribeElement(resource.image!, 'onload', () => {
        resource.loadSub?.cancel();
        resource.errorSub?.cancel();

        this._construct(resource);
        this._continue();
      });

      resource.errorSub = EventStreamProvider.subscribeElement(resource.image!, 'onerror', (e) => {
        resource.loadSub?.cancel();
        resource.errorSub?.cancel();

        const uri = resource.id;
        if (this._map.has(uri)) {
          this._map.delete(uri);
        }

        resource.completeError(e);

        this._continue();
      });
    }
  }

  private _onDeviceLost(): void {
    this._current?.loadSub?.cancel();
    this._current?.errorSub?.cancel();

    this._map.forEach((r, _) => {
      if (r.data) {
        r.data.textureResource.destroy();
      }
    });

    this._contextLost = true;
  }

  private _onDeviceReady(): void {
    this._map.forEach((r, _) => {
      if (r.data && r.image) {
        const texture = this._renderDevice.createTextureFromImage(r.image);
        r.data.textureResource.construct(texture);
      }
    });

    this._contextLost = false;

    if (this._current) {
      this._load(this._current);
    } else {
      this._processQueue();
    }
  }
}
