import { SceneObject } from './288_SceneObject';
import { RenderDevice } from './244_RenderDevice';
import { ILiveCanvasOptions } from './PolyLineSceneObject';
import { Vector2 } from './15_Vector2';
import { ExternalSceneObject } from './external_scene_object';

export class LineDrawerSceneObject extends SceneObject {
  private canvas: HTMLCanvasElement;
  protected context: CanvasRenderingContext2D;
  protected externalSceneObject: ExternalSceneObject;

  constructor(options: ILiveCanvasOptions, renderDevice: RenderDevice) {
    super();
    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    // Calculate canvas dimensions based on line points
    const { minX, maxX, minY, maxY } = this.calculateBounds(options.linePoints);
    const padding = Math.max(options.lineWidth, (options.glowSize || 0) * 2); // Add padding for line width and glow

    canvas.width = maxX - minX + padding * 2;
    canvas.height = maxY - minY + padding * 2;
    this.canvas = canvas;

    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    const context = this.canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.context = context;

    this.externalSceneObject = new ExternalSceneObject(canvas, renderDevice);
    this.externalSceneObject.initialize();
    this.externalSceneObject.position = this.externalSceneObject.position.subtract(
      new Vector2(padding + options.lineWidth * 0.5, padding + options.lineWidth * 0.5)
    );
    this.addChild(this.externalSceneObject);

    // Clear with transparency
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Adjust points to be relative to canvas bounds
    const adjustedPoints = options.linePoints.map(
      (point) => new Vector2(point.x - minX + padding, point.y - minY + padding)
    );

    // Configure glow effect if specified
    if (options.glowSize && options.glowSize > 0) {
      this.context.shadowBlur = options.glowSize;
      this.context.shadowColor = options.lineColor;

      // Apply multiple passes for glow intensity
      const passes = options.glowIntensity || 1;
      for (let i = 0; i < passes; i++) {
        this.drawLine(adjustedPoints, options);
      }
    }

    // Final pass without glow for sharp line
    this.context.shadowBlur = 0;
    this.drawLine(adjustedPoints, options);
    this.position = this.getStartPosition(options.linePoints, options.lineWidth * 0.5);
  }

  private drawLine(points: Vector2[], options: ILiveCanvasOptions) {
    if (points.length === 0) return;

    this.context.beginPath();
    this.context.lineWidth = options.lineWidth;
    this.context.strokeStyle = options.lineColor;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    this.context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      this.context.lineTo(point.x, point.y);
    }

    this.context.stroke();
  }

  private calculateBounds(points: Vector2[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    if (points.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    return points.reduce(
      (bounds, point) => ({
        minX: Math.min(bounds.minX, point.x),
        maxX: Math.max(bounds.maxX, point.x),
        minY: Math.min(bounds.minY, point.y),
        maxY: Math.max(bounds.maxY, point.y),
      }),
      {
        minX: points[0].x,
        maxX: points[0].x,
        minY: points[0].y,
        maxY: points[0].y,
      }
    );
  }

  private getStartPosition(points: Vector2[], padding: number): Vector2 {
    const minX =
      points.reduce((min, current) => (current.x < min.x ? current : min), points[0]).x + padding;
    const minY =
      points.reduce((min, current) => (current.y < min.y ? current : min), points[0]).y + padding;

    return new Vector2(minX, minY);
  }
}
