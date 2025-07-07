import { ButtonBase, IStreamSubscription } from '@cgs/syd';

export class ButtonEntry {
  static fromId(uniqueId: string, index: number) {
    return new ButtonEntry(null, null, uniqueId, index);
  }

  constructor(
    public button: ButtonBase | null,
    public clickSubscription: IStreamSubscription | null,
    public uniqueId: string,
    public index: number
  ) {}
}
