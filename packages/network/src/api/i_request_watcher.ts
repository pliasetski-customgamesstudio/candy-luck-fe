import { IRequestListener } from './i_request_listener';

export interface IRequestWatcher {
  registerListener(requestListener: IRequestListener): void;
  unregisterListener(requestListener: IRequestListener): void;
}
