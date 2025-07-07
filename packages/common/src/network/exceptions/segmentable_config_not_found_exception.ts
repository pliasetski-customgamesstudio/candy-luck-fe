import { BaseApiException } from './base_api_exception';

export class SegmentableConfigNotFoundException extends BaseApiException {
  public readonly name: string = 'SegmentableConfigNotFoundException';
}
