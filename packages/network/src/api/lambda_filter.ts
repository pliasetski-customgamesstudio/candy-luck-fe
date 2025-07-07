import { IRequestFilter } from './i_request_filter';
import { Func4 } from '@cgs/shared';
import { SimpleBaseApiService } from '../simple_base_api_service';
import { ServiceAddress } from '../service_address';

export class LambdaFilter implements IRequestFilter {
  private readonly _filterAction: Func4<SimpleBaseApiService, ServiceAddress, any, any, boolean>;

  constructor(filterAction: Func4<SimpleBaseApiService, ServiceAddress, any, any, boolean>) {
    this._filterAction = filterAction;
  }

  satisfies(
    service: SimpleBaseApiService,
    address: ServiceAddress,
    requestType: any,
    responseType: any
  ): boolean {
    return this._filterAction(service, address, requestType, responseType)!;
  }
}
