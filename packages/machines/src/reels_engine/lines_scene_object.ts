import {
  Color4,
  Effect,
  Matrix3,
  Polyline,
  PolylineData,
  PolylineRenderer,
  SceneObject,
  SpriteBatch,
  Texture,
} from '@cgs/syd';

export class SlotPolyLine extends Polyline {
  lineIndex: number;
  constructor(lineData: PolylineData, lineWidth: number, lineIndex: number, _isClosed?: boolean) {
    super(lineData, lineWidth, _isClosed);
    this.lineIndex = lineIndex;
  }
}

export class LinesSceneObject extends SceneObject {
  private _drawableLines: SlotPolyLine[] = [];
  private _renderer: PolylineRenderer = new PolylineRenderer();

  constructor() {
    super();
    this.color = new Color4(1.0, 1.0, 1.0, 1.0);
  }

  add(line: SlotPolyLine): void {
    this._drawableLines.push(line);
  }

  addRange(lines: SlotPolyLine[]): void {
    lines.forEach((e) => this.add(e));
  }

  GetByIndex(index: number): SlotPolyLine | null {
    if (this._drawableLines.length > 0) {
      const result = this._drawableLines.find((e) => e.lineIndex === index) as SlotPolyLine;
      return result;
    }

    return null;
  }

  remove(line: SlotPolyLine): void {
    const index = this._drawableLines.indexOf(line);
    if (index !== -1) {
      this._drawableLines.splice(index, 1);
    }
  }

  clear(): void {
    this._drawableLines = [];
  }

  drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    spriteBatch.pushState(Effect.Color);
    spriteBatch.pushState(spriteBatch.renderSupport.oneInverseSourceAlpha);
    if (this.color) spriteBatch.pushState(this.color);
    this._drawableLines.forEach((line) => this.drawLine(line, spriteBatch, transform));
    if (this.color) spriteBatch.popState(this.color);
    spriteBatch.popState(spriteBatch.renderSupport.oneInverseSourceAlpha);
    spriteBatch.popState(Effect.Color);
  }

  set texture(value: Texture) {
    this._renderer.texture = value;
  }

  drawLine(line: Polyline, spriteBatch: SpriteBatch, transform: Matrix3): void {
    this._renderer.draw(spriteBatch, line.vertices, transform);
  }
}
