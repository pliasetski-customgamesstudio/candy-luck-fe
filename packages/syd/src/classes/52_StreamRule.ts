import { Rule } from './125_Rule';
import { EventStream } from './22_EventStreamSubscription';

export class StreamRule extends Rule {
  private _triggered: boolean = false;

  constructor(stream: EventStream<any>) {
    super();
    stream.listen((_) => {
      this._triggered = true;
    });
  }

  get isTriggered(): boolean {
    return this._triggered;
  }

  setActive(_active: boolean): void {
    this._triggered = false;
  }
}
