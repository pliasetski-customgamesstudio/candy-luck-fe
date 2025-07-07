export class ServiceAddress {
  static empty(): ServiceAddress {
    return new ServiceAddress('', '', '', '');
  }

  baseUri: string;
  restPath: string;
  httpMethod: string;
  serviceName: string;

  constructor(baseUri: string, serviceName: string, restPath: string, httpMethod: string) {
    this.baseUri = baseUri;
    this.serviceName = serviceName;
    this.restPath = restPath;
    this.httpMethod = httpMethod;
  }

  withBaseUri(baseUri: string): ServiceAddress {
    this.baseUri = baseUri;
    return this;
  }

  withRestPath(restPath: string): ServiceAddress {
    this.restPath = restPath;
    return this;
  }

  withHttpMethod(httpMethod: string): ServiceAddress {
    this.httpMethod = httpMethod;
    return this;
  }

  withServiceName(serviceName: string): ServiceAddress {
    this.serviceName = serviceName;
    return this;
  }
}
