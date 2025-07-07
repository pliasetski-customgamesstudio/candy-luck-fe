export class HttpRequestMessage {
  method: string;
  uri: string;
  body: string;
  contentType: string;
  headers: Map<string, string>;

  constructor(uri: string, method: string) {
    this.uri = uri;
    this.method = method;
  }
}
