import { ServiceAddress } from './service_address';

export interface IServiceAddressCondition {
  isAddressMatch(address: ServiceAddress): boolean;
}

export class ServiceAddressCondition implements IServiceAddressCondition {
  private readonly _baseUri: string;
  private readonly _serviceName: string;
  private readonly _restPath: string;
  private readonly _httpMethod: string;

  constructor(baseUri: string, serviceName: string, restPath: string, httpMethod: string) {
    this._baseUri = baseUri;
    this._serviceName = serviceName;
    this._restPath = restPath;
    this._httpMethod = httpMethod;
  }

  isAddressMatch(address: ServiceAddress): boolean {
    return (
      address.baseUri === this._baseUri &&
      address.serviceName === this._serviceName &&
      address.restPath === this._restPath &&
      address.httpMethod === this._httpMethod
    );
  }
}
