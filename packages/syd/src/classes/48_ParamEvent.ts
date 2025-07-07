import { CgsEvent } from './12_Event';

export class ParamEvent<T> extends CgsEvent {
  readonly param: T;

  constructor(param: T) {
    super();
    this.param = param;
  }
}
