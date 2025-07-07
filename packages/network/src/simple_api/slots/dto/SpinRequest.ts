import { IBaseRequest } from '../../../api/i_base_request';
import { IDtoObject } from '../../../simple_api_request_service';
import { SpinParams } from './SpinParams';

export class SpinRequest implements IBaseRequest, IDtoObject {
  dynamicProperties: Map<any, any> | null;
  sequenceNumber: number | null;
  session: string;
  userId: string | null;
  externalUserId: string | null;
  spinParams: SpinParams | null;
  staticProperties: Map<any, any> | null;

  toJson(): Record<string, unknown> {
    return {
      // dynamicProperties: this.dynamicProperties,
      // sequenceNumber: this.sequenceNumber,
      session: this.session,
      userId: this.userId,
      externalUserId: this.externalUserId,
      spinParams: this.spinParams?.toJson(),
      staticProperties: this.staticProperties,
    };
  }
}
