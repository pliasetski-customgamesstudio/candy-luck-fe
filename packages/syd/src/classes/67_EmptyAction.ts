import { IntervalAction } from './50_IntervalAction';

export class EmptyAction extends IntervalAction {
  beginImpl(): void {}

  endImpl(): void {}

  updateImpl(_dt: number): void {}
}
