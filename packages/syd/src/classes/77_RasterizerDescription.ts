import { Rect } from './112_Rect';

export class RasterizerDescription {
  scissocTestEnable: boolean;
  viewPortEnable: boolean;
  scissor: Rect;

  constructor(description: RasterizerDescription | null = null) {
    if (description) {
      this.scissocTestEnable = description.scissocTestEnable;
      this.viewPortEnable = description.viewPortEnable;
      this.scissor = description.scissor;
    }
  }
}
