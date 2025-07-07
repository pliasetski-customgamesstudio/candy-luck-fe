import {
  clamp,
  Compatibility,
  EventDispatcher,
  EventStream,
  IStreamSubscription,
  lerp,
  Vector2,
  VerticalAlignment,
  View,
  TemplateApplication,
} from '@cgs/syd';
import { IScaleCalculator, Rectangle, RectangleProvider } from './i_scale_calculator';
import { ICoordinateSystemInfoProvider } from '../services/coordinate_system_info_provider';
import { ICanvasManager } from '../canvas/i_canvas_manager';
import { IScaleEntry } from './i_scale_entry';
import { ScaleInfo } from './scale_info';
import { PageInfo } from '../canvas/page_info';
import { Stretch } from './stretch';
import { VoidFunc1 } from '@cgs/shared';

export class ScaleCalculator implements IScaleCalculator {
  private _coordinateSystemProvider: ICoordinateSystemInfoProvider;
  private _canvasManager: ICanvasManager;
  private _gameView: View;
  private _dstRectProvider: RectangleProvider;
  private _scaleEntries: IScaleEntry[];
  private _scaleChangedDispatcher: EventDispatcher<ScaleInfo> = new EventDispatcher<ScaleInfo>();
  private _pageInfo: PageInfo;
  private _sizeChangedSub: IStreamSubscription | null = null;
  private _stretch: Stretch;
  private _verticalAlignment: VerticalAlignment;

  private get _scaleChanged(): EventStream<ScaleInfo> {
    return this._scaleChangedDispatcher.eventStream;
  }

  constructor(
    coordinateSystemProvider: ICoordinateSystemInfoProvider,
    canvasManager: ICanvasManager,
    gameView: View
  ) {
    this._coordinateSystemProvider = coordinateSystemProvider;
    this._canvasManager = canvasManager;
    this._gameView = gameView;
  }

  public async initialize(
    scaleEntries: IScaleEntry[],
    dstRect: Rectangle,
    stretch?: Stretch,
    verticalAlignment?: VerticalAlignment
  ): Promise<void> {
    return this.initializeDynamic(
      scaleEntries,
      () => dstRect,
      stretch ?? Stretch.Uniform,
      verticalAlignment ?? VerticalAlignment.Center
    );
  }

  public async initializeDynamic(
    scaleEntries: IScaleEntry[],
    dstRectProvider: RectangleProvider,
    stretch?: Stretch,
    verticalAlignment?: VerticalAlignment
  ): Promise<void> {
    this._scaleEntries = scaleEntries;
    this._dstRectProvider = dstRectProvider;
    this._stretch = stretch ?? Stretch.Uniform;
    this._verticalAlignment = verticalAlignment ?? VerticalAlignment.Center;
    this.stop();
    this._sizeChangedSub = this._gameView.sizeChanged.listen(() => {
      Promise.resolve().then(() => this.invalidate());
      this.invalidate();
    });
    await this.invalidate();
  }

  private _calculateScaleAndPosition(
    pageInfo: PageInfo,
    canvasWidth: number,
    canvasHeight: number,
    coordinateSystemWidth: number,
    coordinateSystemHeight: number,
    dstRect: Rectangle
  ): ScaleInfo {
    let srcMinRect: Rectangle;
    let srcMaxRect: Rectangle;

    const centerEntry = this._scaleEntries.find((e) => e.centerHorizontal) as IScaleEntry;
    srcMinRect = new Rectangle(
      centerEntry.minBounds.left,
      centerEntry.minBounds.top,
      Compatibility.isPortrait ? centerEntry.minBounds.height : centerEntry.minBounds.width,
      Compatibility.isPortrait ? centerEntry.minBounds.width : centerEntry.minBounds.height
    );

    srcMaxRect = new Rectangle(
      centerEntry.maxBounds.left,
      centerEntry.maxBounds.top,
      Compatibility.isPortrait ? centerEntry.maxBounds.height : centerEntry.maxBounds.width,
      Compatibility.isPortrait ? centerEntry.maxBounds.width : centerEntry.maxBounds.height
    );

    for (const scaleEntry of this._scaleEntries.filter((e) => e !== centerEntry)) {
      if (scaleEntry.minBounds) {
        if (!srcMinRect || (scaleEntry.centerHorizontal && scaleEntry.centerVertical)) {
          srcMinRect = srcMinRect
            ? srcMinRect.boundingBox(scaleEntry.minBounds)
            : scaleEntry.minBounds;
        } else {
          //Expand sides if it's needed to keep current srcMinRect centralized
          let boundingBox = scaleEntry.minBounds.boundingBox(srcMinRect);

          if (!scaleEntry.centerVertical) {
            const topBottomMax = Math.max(
              srcMinRect.top - boundingBox.top,
              boundingBox.bottom - srcMinRect.bottom
            );
            boundingBox = new Rectangle(
              boundingBox.left,
              srcMinRect.top - topBottomMax,
              boundingBox.right,
              srcMinRect.bottom + topBottomMax
            );
          }
          if (!scaleEntry.centerHorizontal) {
            const leftRightMax = Math.max(
              srcMinRect.left - boundingBox.left,
              boundingBox.right - srcMinRect.right
            );
            boundingBox = new Rectangle(
              srcMinRect.left - leftRightMax,
              boundingBox.top,
              srcMinRect.right + leftRightMax,
              boundingBox.bottom
            );
          }
          srcMinRect = boundingBox;
        }
      }
      if (scaleEntry.maxBounds) {
        if (!srcMaxRect || (scaleEntry.centerHorizontal && scaleEntry.centerVertical)) {
          srcMaxRect = srcMaxRect
            ? srcMaxRect.boundingBox(scaleEntry.maxBounds)
            : scaleEntry.maxBounds;
        } else {
          //Expand sides if it's needed to keep current srcMaxRect centralized
          let boundingBox = scaleEntry.maxBounds.boundingBox(srcMaxRect);

          if (!scaleEntry.centerVertical) {
            const leftRightMax = Math.max(
              srcMaxRect.left - boundingBox.left,
              boundingBox.right - srcMaxRect.right
            );
            boundingBox = new Rectangle(
              srcMaxRect.left - leftRightMax,
              boundingBox.top,
              srcMaxRect.right + leftRightMax,
              boundingBox.bottom
            );
          }
          if (!scaleEntry.centerHorizontal) {
            const topBottomMax = Math.max(
              srcMaxRect.top - boundingBox.top,
              boundingBox.bottom - srcMaxRect.bottom
            );
            boundingBox = new Rectangle(
              boundingBox.left,
              srcMaxRect.top - topBottomMax,
              boundingBox.right,
              srcMaxRect.bottom + topBottomMax
            );
          }
          srcMaxRect = boundingBox;
        }
      }
      if (scaleEntry.maxBounds) {
        srcMaxRect = srcMaxRect
          ? srcMaxRect.boundingBox(scaleEntry.maxBounds)
          : scaleEntry.maxBounds;
      }
    }

    srcMaxRect = srcMaxRect!.boundingBox(srcMinRect!);

    let scale = new Vector2(1, 1);
    let offset = new Vector2(0, 0);

    //Size of area that will be visible (in coordinate system).
    //It's equal to canvasSize clamped by min and max Rect.
    //Thus area size will be 1:1 to canvas size if it's within min and max rect.
    const srcWidth = clamp(
      (dstRect.width * canvasWidth) / coordinateSystemWidth,
      srcMinRect.width,
      srcMaxRect.width
    );
    //Calculate leftmost position of the area (in coordinate system).
    const fractalX = (srcWidth - srcMinRect.width) / (srcMaxRect.width - srcMinRect.width);
    const srcLeft = lerp(srcMinRect.left, srcMaxRect.left, isNaN(fractalX) ? 0.0 : fractalX);

    const srcHeight = clamp(
      (dstRect.height * canvasHeight) / coordinateSystemHeight,
      srcMinRect.height,
      srcMaxRect.height
    );
    const fractalY = (srcHeight - srcMinRect.height) / (srcMaxRect.height - srcMinRect.height);
    const srcTop = lerp(srcMinRect.top, srcMaxRect.top, isNaN(fractalY) ? 0.0 : fractalY);

    //Aspect ration of area that will be visible
    const srcAspect = srcWidth / srcHeight;

    //Aspect ration of coordinate system size
    const coordinateSystemAspect = coordinateSystemWidth / coordinateSystemHeight;

    const dstWidthPixels = (dstRect.width / coordinateSystemWidth) * canvasWidth;
    const dstHeightPixels = (dstRect.height / coordinateSystemHeight) * canvasHeight;
    const dstAspectPixels = dstWidthPixels / dstHeightPixels;

    //Compare canvas (pixels size) and visible area (in coordinate system) aspects to determinate whether blank spaces will be on left/right or top/bottom sides
    if (
      (this._stretch === Stretch.Uniform && dstAspectPixels > srcAspect) ||
      (this._stretch === Stretch.UniformToFit && dstAspectPixels < srcAspect)
    ) {
      //Scale by Y to fill exactly target area height (targetHeight)
      const scaleY = dstRect.height / srcHeight;
      //We already know height of visible area in pixels. It's canvasHeight, thus to uniform it we need to calculate width of target area in pixels keeping aspect ratio in coordinate system.
      const widthToKeepAspect = coordinateSystemAspect * canvasHeight;
      //Scale X just to keep aspect ratio because we will have blank spaces on sides anyway.
      scale = new Vector2((widthToKeepAspect * scaleY) / canvasWidth, scaleY);

      const newSrcWidth = clamp(dstRect.width / scale.x, srcMinRect.width, srcMaxRect.width);
      const newFractalX = (newSrcWidth - srcMinRect.width) / (srcMaxRect.width - srcMinRect.width);
      const newSrcLeft = lerp(
        srcMinRect.left,
        srcMaxRect.left,
        isNaN(newFractalX) ? 0.0 : newFractalX
      );

      let offsetY = 0.0;
      if (this._verticalAlignment === VerticalAlignment.Center) {
        offsetY = -(srcTop * scale.y) + dstRect.top + (dstRect.height - srcHeight * scale.y) / 2;
      } else if (this._verticalAlignment === VerticalAlignment.Top) {
        offsetY = 0.0;
      } else if (this._verticalAlignment === VerticalAlignment.Bottom) {
        //TODO: not implemented
      }
      offset = new Vector2(
        -(newSrcLeft * scale.x) + dstRect.left + (dstRect.width - newSrcWidth * scale.x) / 2,
        offsetY
      );
    } else {
      const scaleX = dstRect.width / srcWidth;
      const heightToKeepAspect = canvasWidth / coordinateSystemAspect;
      scale = new Vector2(scaleX, (heightToKeepAspect * scaleX) / canvasHeight);

      const newSrcHeight = clamp(dstRect.height / scale.y, srcMinRect.height, srcMaxRect.height);
      const newFractalY =
        (newSrcHeight - srcMinRect.height) / (srcMaxRect.height - srcMinRect.height);
      const newSrcTop = lerp(
        srcMinRect.top,
        srcMaxRect.top,
        isNaN(newFractalY) ? 0.0 : newFractalY
      );

      let offsetY = 0.0;
      if (this._verticalAlignment === VerticalAlignment.Center) {
        offsetY =
          -(newSrcTop * scale.y) + dstRect.top + (dstRect.height - newSrcHeight * scale.y) / 2;
      } else if (this._verticalAlignment === VerticalAlignment.Top) {
        offsetY = 0.0;
      } else if (this._verticalAlignment === VerticalAlignment.Bottom) {
        //TODO: not implemented
      }
      offset = new Vector2(
        -(srcLeft * scale.x) + dstRect.left + (dstRect.width - srcWidth * scale.x) / 2,
        offsetY
      );
    }
    return new ScaleInfo(scale, offset);
  }

  public async invalidate(): Promise<void> {
    this._pageInfo = await this._canvasManager.getPageInfo();
    this._onScaleChanged();
  }

  private _onScaleChanged(): void {
    const scaleInfo = this._updateScale();
    if (scaleInfo) {
      TemplateApplication.scale = scaleInfo.scale;
      this._scaleChangedDispatcher.dispatchEvent(scaleInfo);
    }
  }

  private _updateScale(): ScaleInfo | null {
    if (this._pageInfo && this._sizeChangedSub) {
      const coordinateSystem = this._coordinateSystemProvider.coordinateSystem;
      let dstRect = this._dstRectProvider();
      const clientViewport = new Rectangle(
        0.0,
        0.0,
        coordinateSystem.width,
        (this._pageInfo.clientHeight / this._gameView.height) * coordinateSystem.height
      );
      dstRect = dstRect.intersection(clientViewport);
      return this._calculateScaleAndPosition(
        this._pageInfo,
        this._gameView.width,
        this._gameView.height,
        coordinateSystem.width,
        coordinateSystem.height,
        dstRect
      );
    }
    return null;
  }

  public stop(): void {
    this._sizeChangedSub?.cancel();
    this._sizeChangedSub = null;
    // this._dstRectProvider = null;
  }

  public reset(): void {
    this._scaleChangedDispatcher.dispatchEvent(new ScaleInfo(new Vector2(1, 1), new Vector2(0, 0)));
  }

  public addScaleChangedListener(listener: VoidFunc1<ScaleInfo>): IStreamSubscription {
    const sub = this._scaleChanged.listen(listener);
    this._onScaleChanged();
    return sub;
  }
}
