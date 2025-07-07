import { ServiceAddress } from '../service_address';
import { SimpleBaseApiService } from '../simple_base_api_service';

export interface IRequestFilter {
  satisfies(
    service: SimpleBaseApiService,
    address: ServiceAddress,
    requestType: any,
    responseType: any
  ): boolean;
}
