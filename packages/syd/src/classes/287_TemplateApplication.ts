import { Rect } from './112_Rect';
import { CgsEvent } from './12_Event';
import { Vector2 } from './15_Vector2';
import { AbstractMouseEvent } from './161_AbstractMouseEvent';
import { Keyboard } from './217_Keyboard';
import { RenderSupport } from './241_RenderSupport';
import { SpriteBatch } from './248_SpriteBatch';
import { Application } from './258_Application';
import { MouseEventTranslator } from './259_MouseEventTranslator';
import { SpriteBatchCanvas } from './281_SpriteBatchCanvas';
import { Platform } from './282_Platform';
import { SpriteBatchWebGL } from './290_SpriteBatchWebGL';
import { Matrix3 } from './57_Matrix3';
import { DebugConsole } from './173_DebugConsole';
import { IConcreteResourceCache } from './23_IResourceCache';

export abstract class TemplateApplication extends Application {
  private _spriteBatch: SpriteBatch;
  private _mouseEventTranslator: MouseEventTranslator;
  private _keyboard: Keyboard;

  public static scale = new Vector2(1, 1);

  constructor(platform: Platform, resourceCache: IConcreteResourceCache, coordinateSystem: Rect) {
    super(platform, resourceCache, coordinateSystem);
    this._mouseEventTranslator = new MouseEventTranslator(platform.inputSystem.mouse);
    this._keyboard = platform.inputSystem.keyboard;

    if (platform.videoSystem.isWebGL) {
      const renderSupport = new RenderSupport(resourceCache, 'default');
      this._spriteBatch = new SpriteBatchWebGL(
        platform.view,
        platform.videoSystem.renderContext!,
        platform.videoSystem.renderDevice,
        renderSupport
      );
    } else {
      const renderSupport = new RenderSupport(resourceCache, '');
      this._spriteBatch = new SpriteBatchCanvas(platform.view, renderSupport);
    }

    if (coordinateSystem) {
      this.setCoordinateSystem(coordinateSystem);

      platform.view.sizeChanged.listen((_) => {
        this.setCoordinateSystem(coordinateSystem);
      });
    }
  }

  onLoaded(): void {
    this._mouseEventTranslator.subscribe((e) => this.dispatchEvent(e));
    this._keyboard.keyDown.listen((e) => this.dispatchEvent(e));
  }

  setCoordinateSystem(rect: Rect): void {
    this._spriteBatch.setCoordinateSystem(rect);

    const viewSize = new Vector2(this.platform.view.width, this.platform.view.height);
    const coordinateSystemSize = rect.size;
    const mouseTransform = Matrix3.fromScale(
      coordinateSystemSize.x / viewSize.x,
      coordinateSystemSize.y / viewSize.y
    ).multiply(Matrix3.fromTranslation(rect.lt.x, rect.lt.y));

    this._mouseEventTranslator.setTransform(mouseTransform);
  }

  draw(): void {
    const spriteBatch = this._spriteBatch;

    spriteBatch.begin();
    this.drawImpl(spriteBatch);
    spriteBatch.end();

    const batchesCount = spriteBatch.batchesCount;
    const trianglesCount = spriteBatch.trianglesCount;

    DebugConsole.Print(`batches: ${batchesCount} triangles: ${trianglesCount}`);
  }

  update(dt: number): void {
    this.updateImpl(dt);
  }

  handleMouseEvents(events: AbstractMouseEvent[]): void {
    for (let i = 0; i < events.length; ++i) {
      this.dispatchEvent(events[i]);
    }
  }

  abstract updateImpl(dt: number): void;

  abstract drawImpl(spriteBatch: SpriteBatch): void;

  abstract dispatchEvent(event?: CgsEvent): void;

  contextLost(): void {
    this._spriteBatch.contextLost();
    this.resourceCache.contextLost();
  }

  async contextReady(): Promise<void> {
    this._spriteBatch.contextReady();
    await this.resourceCache.contextReady();
  }
}
