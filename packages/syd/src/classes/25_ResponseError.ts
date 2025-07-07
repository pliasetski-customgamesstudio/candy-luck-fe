import { Compatibility } from './16_Compatibility';

export class ResponseError extends Error {
  public readonly name: string = 'ResponseError';
  status: number;
  url: string;
  statusText: string;
  responseText: string;

  constructor(url: string, status: number, statusText: string, responseText: string) {
    super();

    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.responseText = responseText;
    this.message = this.getErrorMessage();
  }

  private getErrorMessage(): string {
    let result = `Failed to load ${this.url}\nServer responded: ${this.status}`;
    if (!Compatibility.IsIE) {
      result += ` ${this.statusText}\n${this.responseText}`;
    }
    return result;
  }
}
