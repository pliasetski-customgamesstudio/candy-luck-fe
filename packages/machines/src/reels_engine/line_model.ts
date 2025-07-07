import {
  PolylineData,
  PolylineDataItem,
  Vector2,
  Color4,
  parseValue,
  PropertyType,
} from '@cgs/syd';
import { SlotPolyLine } from './lines_scene_object';

export interface AbstractLineIndex {
  equals(other: any): boolean;
  hashCode(): number;
}

export class RegularLineIndex implements AbstractLineIndex {
  public _index: number;

  constructor(index: number) {
    this._index = index;
  }

  equals(_other: any): boolean {
    return true;
  }

  hashCode(): number {
    return this._index;
  }
}

export class SymbolLineIndex implements AbstractLineIndex {
  public _index: number;

  constructor(index: number) {
    this._index = index;
  }

  equals(_other: any): boolean {
    return true;
  }

  hashCode(): number {
    return this._index;
  }
}

export class LineModel {
  private _emptyLineData: PolylineData;
  private _emptyPolyline: SlotPolyLine;

  private _lines: Array<[SlotPolyLine, PolylineData]>;
  private _symbolLines: Array<[SlotPolyLine, PolylineData]>;
  private lineWidth: number;

  constructor(linesResource: any, symbolLinesResource: any, _lineWidth: number) {
    const lines = linesResource['resource']['lines'];

    this._lines = [];
    for (let i = 0; i < lines.length; i++) {
      this._lines.push(this._createLineData(lines[i], i));
    }

    const symbolLines = symbolLinesResource['resource']['lines'];
    this._symbolLines = [];
    for (let i = 0; i < symbolLines.length; i++) {
      this._symbolLines.push(this._createLineData(symbolLines[i], i, true));
    }

    const emptyDataItem = new PolylineDataItem(Vector2.Zero, new Color4(1.0, 1.0, 0.0, 1.0));
    this._emptyLineData = new PolylineData([emptyDataItem, emptyDataItem]);
    this._emptyPolyline = new SlotPolyLine(this._emptyLineData, 0.0, -1);
  }

  private _createLineData(
    lineResource: any,
    index: number,
    isClosed?: boolean
  ): [SlotPolyLine, PolylineData] {
    const points = lineResource['points'];
    const dataItems = points.map((lineItemResource: any) =>
      this._createLineDataItem(lineItemResource)
    );
    const data = new PolylineData(dataItems);
    return [new SlotPolyLine(data, this.lineWidth, index, isClosed), data];
  }

  private _createLineDataItem(lineItemResource: any): PolylineDataItem {
    const pos = parseValue(PropertyType.Vector2, lineItemResource['point'], Vector2.Zero);
    const color = parseValue(PropertyType.Color4i, lineItemResource['color'], Color4.White);
    return new PolylineDataItem(pos, color);
  }

  private _getLine(from: Array<[SlotPolyLine, PolylineData]>, index: number): SlotPolyLine {
    return index >= 0 ? from[index][0] : this._emptyPolyline;
  }

  private _getData(from: Array<[SlotPolyLine, PolylineData]>, index: number): PolylineData {
    return index >= 0 ? from[index][1] : this._emptyLineData;
  }

  getLine(index: AbstractLineIndex): SlotPolyLine | null {
    if (index instanceof RegularLineIndex) {
      const lineIdx = index as RegularLineIndex;
      return this._getLine(this._lines, lineIdx._index);
    }
    if (index instanceof SymbolLineIndex) {
      const lineIdx = index as SymbolLineIndex;
      return this._getLine(this._symbolLines, lineIdx._index);
    }
    return null;
  }

  getLineData(index: AbstractLineIndex): PolylineData | null {
    if (index instanceof RegularLineIndex) {
      const lineIdx = index as RegularLineIndex;
      return this._getData(this._lines, lineIdx._index);
    }
    if (index instanceof SymbolLineIndex) {
      const lineIdx = index as SymbolLineIndex;
      return this._getData(this._symbolLines, lineIdx._index);
    }
    return null;
  }

  getLinesCount(indexType: any): number | null {
    if (indexType === RegularLineIndex) {
      return this._lines.length;
    }
    if (indexType === SymbolLineIndex) {
      return this._symbolLines.length;
    }
    return null;
  }
}
