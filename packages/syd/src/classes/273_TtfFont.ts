import { DimensionSourceScale } from './38_DimensionSourceScale';
import { MultiLineFont } from './18_MultiLineFont';
import { RenderDevice } from './244_RenderDevice';
import { Vector2 } from './15_Vector2';
import { HorizontalAlignment } from './73_HorizontalAlignment';
import { VerticalAlignment } from './66_VerticalAlignment';
import { toCanvasTextAlign, toCanvasTextBaseline } from './globalFunctions';
import { TextRenderParameters } from './160_TextRenderParameters';
import { TextSprite } from './133_TextSprite';
import { Rect } from './112_Rect';
import { DimensionSource } from './131_DimensionSource';
import { Log } from './81_Log';

export class TtfFont extends MultiLineFont {
  private _renderDevice: RenderDevice;
  private _fontFamily: string;
  private _lines: string[];
  private _maximumTextWidth: number | null = null;
  private _context: CanvasRenderingContext2D;

  constructor(renderDevice: RenderDevice) {
    super();
    this._renderDevice = renderDevice;
  }

  private _initRenderingContextForText(
    canvas: HTMLCanvasElement,
    size: Vector2,
    fontSize: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment
  ): CanvasRenderingContext2D {
    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.clearRect(0, 0, size.x, size.y);
    context.textAlign = toCanvasTextAlign(halign);
    context.textBaseline = toCanvasTextBaseline(valign);
    context.fillStyle = '#fff';
    context.font = this._font(fontSize);
    return context;
  }

  public build(
    parameters: TextRenderParameters,
    text: string,
    size: Vector2,
    fontFamily: string,
    fontSize: number,
    lineSpacing: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    multiline: boolean = true,
    cursorPosition: number = -1
  ): TextSprite {
    this._fontFamily = fontFamily;
    let canvas = document.createElement('canvas');
    canvas.width = size.x;
    canvas.height = size.y;
    let context = this._initRenderingContextForText(canvas, size, fontSize, halign, valign);
    let drawSize = size;

    if (text) {
      drawSize = this.drawText(
        context,
        parameters,
        text,
        size,
        fontSize,
        lineSpacing,
        multiline,
        cursorPosition
      );
    }

    if (drawSize.x !== size.x || drawSize.y !== size.y) {
      canvas = new HTMLCanvasElement();
      canvas.width = drawSize.x;
      canvas.height = drawSize.y;
      context = this._initRenderingContextForText(canvas, drawSize, fontSize, halign, valign);
      this.drawText(
        context,
        parameters,
        text,
        size,
        fontSize,
        lineSpacing,
        multiline,
        cursorPosition
      );
    }

    const texture = this._renderDevice.createTextureFromCanvas(canvas)!;
    this._context = context;

    return new TextSprite(texture, new Rect(Vector2.Zero, drawSize));
  }

  private _font(fontSize: number): string {
    return `${fontSize.toString()}px '${this._fontFamily}'`;
  }

  private drawText(
    context: CanvasRenderingContext2D,
    parameters: TextRenderParameters,
    text: string,
    size: Vector2,
    fontSize: number,
    lineSpacing: number,
    multiline: boolean,
    cursorPosition: number
  ): Vector2 {
    const linesAndWidth = this._splitLinesAndGetMaxWidth(
      context,
      parameters,
      size,
      text,
      multiline
    );
    const lines = linesAndWidth[0];
    const maxWidth = linesAndWidth[1];
    this._lines = lines;
    this._maximumTextWidth = maxWidth;
    fontSize = this._downscaleIfNeeded(context, parameters, size, fontSize, maxWidth);

    const x = this._getXPositionForText(context, size);
    const y = this._getYPositionForText(context, size, fontSize, lineSpacing, lines);

    this._drawLines(context, lines, fontSize, lineSpacing, x, y, cursorPosition);

    let drawSize = size;
    const needIncreaseWidth =
      maxWidth > size.x && parameters.dimensionSourceScale !== DimensionSourceScale.DownOnly;
    if (needIncreaseWidth) {
      drawSize = new Vector2(needIncreaseWidth ? maxWidth : size.x, size.y);
    }

    return drawSize;
  }

  private _downscaleIfNeeded(
    context: CanvasRenderingContext2D,
    parameters: TextRenderParameters,
    size: Vector2,
    fontSize: number,
    maxWidth: number
  ): number {
    if (parameters.dimensionSourceScale === DimensionSourceScale.DownOnly && maxWidth > size.x) {
      fontSize = (fontSize * size.x) / maxWidth;
      context.font = this._font(fontSize);
    }
    return fontSize;
  }

  private _splitLinesAndGetMaxWidth(
    context: CanvasRenderingContext2D,
    parameters: TextRenderParameters,
    size: Vector2,
    text: string,
    multiline: boolean
  ): [string[], number] {
    let cutWidth = size.x;
    let maxWidth = 0.0;

    if (parameters.dimensionSourceScale === DimensionSourceScale.DownOnly) {
      cutWidth = 0.0;
    }

    const measureText = (text: string): number => {
      const width = context.measureText(text).width;
      if (width > maxWidth) {
        maxWidth = width;
      }
      return width;
    };

    let lines: string[];

    if (multiline) {
      lines = this.splitText(measureText, text, cutWidth);
    } else {
      lines = [text];
      maxWidth = context.measureText(text).width;
    }

    return [lines, maxWidth];
  }

  private _getXPositionForText(context: CanvasRenderingContext2D, size: Vector2): number {
    let x = 0;

    switch (context.textAlign) {
      case 'center':
        x = size.x / 2;
        break;
      case 'right':
        x = size.x;
        break;
    }

    return x;
  }

  private _getYPositionForText(
    context: CanvasRenderingContext2D,
    size: Vector2,
    fontSize: number,
    lineSpacing: number,
    lines: string[]
  ): number {
    let y = 0;

    switch (context.textBaseline) {
      case 'middle':
        y = size.y / 2;
        if (lines.length > 1) {
          y -= (lines.length * fontSize + (lines.length - 1) * lineSpacing) / 2 - fontSize / 2;
        }
        break;
      case 'bottom':
        y = size.y;
        if (lines.length > 1) {
          y -= (lines.length - 1) * (fontSize + lineSpacing);
        }
        break;
    }

    return y;
  }

  private _drawLines(
    context: CanvasRenderingContext2D,
    lines: string[],
    fontSize: number,
    lineSpacing: number,
    x: number,
    y: number,
    cursorPosition: number
  ): void {
    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], x, y);

      if (i === 0 && cursorPosition !== -1) {
        const lineWidth = context.measureText(lines[i]).width;

        if (cursorPosition > lines[i].length) {
          console.log('Probably bug');
        }

        const cursorX =
          cursorPosition === 0
            ? 0.0
            : context.measureText(lines[i].substring(0, cursorPosition)).width;

        const savedAlign = context.textAlign;
        let textStart = 0.0;

        switch (context.textAlign) {
          case 'center':
            textStart = x - lineWidth / 2;
            break;
          case 'right':
            textStart = x - lineWidth;
            break;
        }

        context.textAlign = 'center';
        context.fillText('|', textStart + cursorX, y - fontSize * 0.1);
        context.textAlign = savedAlign;
      }

      y += fontSize + lineSpacing;
    }
  }

  public get maximumTextWidth(): number | null {
    return this._maximumTextWidth;
  }

  public getLines(): string[] {
    return this._lines;
  }

  public measureText(text: string): number | null {
    if (!this._context) {
      return null;
    }
    return this._context.measureText(text).width;
  }

  public dispose(data: TextSprite): void {
    data.texture.dispose();
  }

  public calcCursorPositionForPoint(
    point: Vector2,
    parameters: TextRenderParameters,
    text: string,
    size: Vector2,
    fontFamily: string,
    fontSize: number,
    lineSpacing: number,
    halign: HorizontalAlignment,
    valign: VerticalAlignment,
    multiline: boolean = false
  ): [number, number] {
    const canvas = new HTMLCanvasElement();
    canvas.width = size.x;
    canvas.height = size.y;
    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.clearRect(0, 0, size.x, size.y);
    context.textAlign = toCanvasTextAlign(halign);
    context.textBaseline = toCanvasTextBaseline(valign);
    context.fillStyle = '#fff';
    context.font = this._font(fontSize);

    if (text) {
      return this._calcCursorPositionForPointInner(
        point,
        context,
        parameters,
        text,
        size,
        fontSize,
        lineSpacing,
        multiline
      );
    }

    return [0, 0];
  }

  private _calcCursorPositionForPointInner(
    point: Vector2,
    context: CanvasRenderingContext2D,
    parameters: TextRenderParameters,
    text: string,
    size: Vector2,
    fontSize: number,
    lineSpacing: number,
    multiline: boolean
  ): [number, number] {
    const linesAndWidth = this._splitLinesAndGetMaxWidth(
      context,
      parameters,
      size,
      text,
      multiline
    );
    const lines = linesAndWidth[0];
    const maxWidth = linesAndWidth[1];
    fontSize = this._downscaleIfNeeded(context, parameters, size, fontSize, maxWidth);

    const x = this._getXPositionForText(context, size);
    const y = this._getYPositionForText(context, size, fontSize, lineSpacing, lines);

    return this._calcCursorPositionForLines(point, context, lines, fontSize, lineSpacing, x, y);
  }

  private _calcCursorPositionForLines(
    point: Vector2,
    context: CanvasRenderingContext2D,
    lines: string[],
    fontSize: number,
    lineSpacing: number,
    x: number,
    y: number
  ): [number, number] {
    const binarySearch = (
      x: number,
      line: string,
      lineStart: number,
      startIndex: number,
      endIndex: number
    ): number => {
      if (x <= lineStart) {
        return startIndex;
      }
      if (line.length === 0) {
        return 0;
      }
      const widthToStart =
        startIndex === 0 ? 0.0 : context.measureText(line.substring(0, startIndex)).width;
      const widthToEnd = context.measureText(line.substring(0, endIndex + 1)).width;

      if (lineStart + widthToStart > x || lineStart + widthToEnd < x) {
        return -1;
      }

      if (endIndex <= startIndex) {
        if (lineStart + (widthToStart + widthToEnd) / 2 > x) {
          return startIndex;
        }
        return startIndex + 1;
      }

      const midIndex = Math.floor((startIndex + endIndex) / 2);
      const leftSearch = binarySearch(x, line, lineStart, startIndex, midIndex);

      if (leftSearch !== -1) {
        return leftSearch;
      }

      const rightSearch = binarySearch(x, line, lineStart, midIndex + 1, endIndex);
      return rightSearch;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      y += fontSize + lineSpacing;

      if (y >= point.y || i === line.length - 1) {
        if (line.length === 0) {
          return [0, i];
        }

        const textMetrics = context.measureText(line);
        let textStart = 0.0;

        switch (context.textAlign) {
          case 'center':
            textStart = x - textMetrics.width / 2;
            break;
          case 'right':
            textStart = x - textMetrics.width;
            break;
        }

        if (point.x <= textStart) {
          return [0, i];
        }

        if (point.x >= textStart + textMetrics.width) {
          return [line.length, i];
        }

        const cursorPosition = binarySearch(point.x, line, textStart, 0, line.length - 1);
        return [cursorPosition, i];
      }
    }

    return [0, 0];
  }

  public CalculateInverseScale(
    dimensionSource: DimensionSource,
    dimensionSourceScale: DimensionSourceScale,
    size: Vector2,
    bounds: Vector2
  ): Vector2 {
    let res: Vector2;

    switch (dimensionSource) {
      case DimensionSource.ProportionalSize: {
        const factorX = bounds.x / size.x;
        const factorY = bounds.y / size.y;
        let fx = factorX > factorY ? factorX : factorY;

        switch (dimensionSourceScale) {
          case DimensionSourceScale.DownOnly:
            if (fx < 1.0) {
              fx = 1.0;
            }
            break;
          case DimensionSourceScale.UpOnly:
            if (fx > 1.0) {
              fx = 1.0;
            }
            break;
        }

        res = new Vector2(fx, fx);
        break;
      }
      case DimensionSource.Size: {
        let factorX = bounds.x / size.x;
        let factorY = bounds.y / size.y;

        switch (dimensionSourceScale) {
          case DimensionSourceScale.DownOnly:
            if (factorX < 1.0) {
              factorX = 1.0;
            }
            if (factorY < 1.0) {
              factorY = 1.0;
            }
            break;
          case DimensionSourceScale.UpOnly:
            if (factorX > 1.0) {
              factorX = 1.0;
            }
            if (factorY > 1.0) {
              factorY = 1.0;
            }
            break;
        }

        res = new Vector2(factorX, factorY);
        break;
      }
      default:
        Log.Error(
          `CalculateInverseScale doesn't support DimensionSourceScale=${dimensionSourceScale}`
        );
        throw new Error(
          `CalculateInverseScale doesn't support DimensionSourceScale=${dimensionSourceScale}`
        );
    }

    return res;
  }
}
