import { ServiceAddress } from '../service_address';
import { SimpleBaseApiService } from '../simple_base_api_service';

export interface IRequestNotifier {
  onRequest<TRequest, TResponse>(
    service: SimpleBaseApiService,
    address: ServiceAddress,
    request: TRequest,
    response: TResponse
  ): Promise<void>;
}
