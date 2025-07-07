export interface ISpinParams {
  autoSpin: boolean;
}

export class SlotSpinParams implements ISpinParams {
  autoSpin: boolean = false;
}
