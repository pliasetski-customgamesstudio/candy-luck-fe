export class IconValueDescription {
  private _scenePath: string;
  private _valueTextNodeId: string;
  private _state: string;
  private _numberValue: number;
  private _positionOnReels: number;

  get scenePath(): string {
    return this._scenePath;
  }

  get valueTextNodeId(): string {
    return this._valueTextNodeId;
  }

  get state(): string {
    return this._state;
  }

  get numberValue(): number {
    return this._numberValue;
  }

  get positionOnReels(): number {
    return this._positionOnReels;
  }

  constructor(
    scenePath: string,
    valueTextNodeId: string,
    numberValue: number,
    positionOnReels: number,
    state: string
  ) {
    this._scenePath = scenePath;
    this._valueTextNodeId = valueTextNodeId;
    this._numberValue = numberValue;
    this._positionOnReels = positionOnReels;
    this._state = state;
  }

  equals(other: any): boolean {
    if (this === other) {
      return true;
    }
    return (
      other instanceof IconValueDescription &&
      this._scenePath === other._scenePath &&
      this._valueTextNodeId === other._valueTextNodeId &&
      this._state === other._state &&
      this._numberValue === other._numberValue &&
      this._positionOnReels === other._positionOnReels
    );
  }
}
