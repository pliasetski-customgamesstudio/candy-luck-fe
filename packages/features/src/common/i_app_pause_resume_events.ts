import { EventStream } from '@cgs/syd';

export const T_IAppPauseResumeEvents = Symbol('IAppPauseResumeEvents');
export interface IAppPauseResumeEvents {
  get paused(): EventStream<void>;
  get resumed(): EventStream<void>;
}
