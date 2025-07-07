import { IRequestNotifier } from './i_request_notifier';
import { IRequestFilter } from './i_request_filter';

export interface IRequestListener extends IRequestNotifier {
  filter: IRequestFilter;
}
