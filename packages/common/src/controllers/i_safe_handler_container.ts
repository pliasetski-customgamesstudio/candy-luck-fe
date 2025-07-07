import { Func0 } from '@cgs/shared';
import { EventStream } from '@cgs/syd';

export interface ISafeHandlerContainer {
  setupEventHandler(
    subscribeStream: EventStream<any>,
    handlerCreateFunc: Func0<Promise<any>>,
    once?: boolean,
    minSpan?: number
  ): void;
}
