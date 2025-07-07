import { IconValueDescription } from './icon_value_description';

export class MultiSceneIconValueDescription {
  private _scenePath: string;
  private _valueTextNodeId: string;
  private _state: string | null;
  private _numberValue: number;
  private _positionOnReels: number;

  get scenePath(): string {
    return this._scenePath;
  }

  get valueTextNodeId(): string {
    return this._valueTextNodeId;
  }

  get state(): string | null {
    return this._state;
  }

  get numberValue(): number {
    return this._numberValue;
  }

  get positionOnReels(): number {
    return this._positionOnReels;
  }

  constructor(
    valueTextNodeId: string,
    numberValue: number,
    positionOnReels: number,
    state: string | null
  ) {
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
      this._scenePath === other.scenePath &&
      this._valueTextNodeId === other.valueTextNodeId &&
      this._state === other.state &&
      this._numberValue === other.numberValue &&
      this._positionOnReels === other.positionOnReels
    );
  }
}
