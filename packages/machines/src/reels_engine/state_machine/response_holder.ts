import { ISpinResponse } from '@cgs/common';

export class ResponseHolder<TResponse extends ISpinResponse> {
  curResponse: TResponse;
  preResponse: TResponse;
  curServerResponse: TResponse | null = null;
}
