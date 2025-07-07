import { Logger } from '@cgs/shared';
import { ResponseConverter } from './response_converter';

export class ResponseConverterFactory<Tin, Tout> {
  private _map: Map<number, ResponseConverter<Tin, Tout>> = new Map<
    number,
    ResponseConverter<Tin, Tout>
  >();

  public getConverter(
    inType: any,
    outType: any,
    outResp: any
  ): ResponseConverter<Tin, Tout> | undefined {
    Logger.Debug('!!!!!!!!!!!TIn' + inType.toString());
    Logger.Debug('!!!!!!!!!!!TOut' + outType.toString());

    const result = this._map.get(this._makeHash(inType, outType));
    return result;
  }

  public register(inType: any, outType: any, converter: ResponseConverter<Tin, Tout>): void {
    this._map.set(this._makeHash(inType, outType), converter);
  }

  private _makeHash(inType: any, outType: any): number {
    return -inType.hashCode ^ outType.hashCode;
  }
}
