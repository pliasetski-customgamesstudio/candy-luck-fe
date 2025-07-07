import { EventStream } from './22_EventStreamSubscription';

export const T_IFramePulse = Symbol('IFramePulse');
export interface IFramePulse {
  active: boolean;
  framePulsate: EventStream<number>;
}
