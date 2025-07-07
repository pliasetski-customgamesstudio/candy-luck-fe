import { ServiceAddress } from '../service_address';
import { IRequestWatcher } from './i_request_watcher';
import { IRequestNotifier } from './i_request_notifier';
import { IRequestListener } from './i_request_listener';
import { SimpleBaseApiService } from '../simple_base_api_service';

export class RequestWatcher implements IRequestWatcher, IRequestNotifier {
  private _listeners: IRequestListener[] = [];

  public registerListener(listener: IRequestListener): void {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
    }
  }

  public unregisterListener(listener: IRequestListener): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  async onRequest<TRequest, TResponse>(
    service: SimpleBaseApiService,
    address: ServiceAddress,
    request: TRequest,
    response: TResponse
  ): Promise<void> {
    for (const requestListener of this._listeners) {
      if (requestListener.filter.satisfies(service, address, typeof request, typeof response)) {
        await requestListener.onRequest(service, address, request, response);
      }
    }
  }

  public dispose(): void {
    this._listeners = [];
  }
}
