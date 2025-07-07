import { MultiSceneIconValueDescription } from './multi_scene_icon_value_description';
import { StringUtils } from '@cgs/shared';

export class MultiSceneIconValueDescriptionWithText extends MultiSceneIconValueDescription {
  private _text: string;
  get hasText(): boolean {
    return !StringUtils.isNullOrWhiteSpace(this._text);
  }

  get text(): string {
    return this._text;
  }

  constructor(valueTextNodeId: string, text: string, positionOnReels: number, state: string) {
    super(valueTextNodeId, 0.0, positionOnReels, state);
    this._text = text;
  }

  equals(other: any): boolean {
    if (this === other) {
      return true;
    }
    return (
      other instanceof MultiSceneIconValueDescriptionWithText &&
      this.scenePath === other.scenePath &&
      this._text === other.text &&
      this.valueTextNodeId === other.valueTextNodeId &&
      this.state === other.state &&
      this.numberValue === other.numberValue &&
      this.positionOnReels === other.positionOnReels
    );
  }
}
