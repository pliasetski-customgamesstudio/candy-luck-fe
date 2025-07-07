import { IBaseRequest } from '../../../api/i_base_request';
import { IDtoObject } from '../../../simple_api_request_service';

export class StartMachineRequest implements IBaseRequest, IDtoObject {
  dynamicProperties: Map<any, any>;
  machineId: string | null;
  sequenceNumber: number | null;
  session: string;
  userId: string | null;
  externalUserId: string | null;
  staticProperties: Map<any, any>;

  toJson(): Record<string, unknown> {
    return {
      dynamicProperties: this.dynamicProperties,
      machineId: this.machineId,
      sequenceNumber: this.sequenceNumber,
      session: this.session,
      userId: this.userId,
      externalUserId: this.externalUserId,
      staticProperties: this.staticProperties,
    };
  }
}
