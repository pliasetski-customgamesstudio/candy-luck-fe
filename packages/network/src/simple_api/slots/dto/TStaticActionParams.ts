import { IBaseRequest } from '../../../api/i_base_request';
import { IDtoObject } from '../../../simple_api_request_service';

export class TStaticActionParams implements IBaseRequest, IDtoObject {
  actionId: number | null;
  machineId: string | null;
  moduleIndex: number | null;
  pickIndex: number | null;
  sequenceNumber: number | null;
  session: string;
  userId: string | null;
  externalUserId: string | null;

  toJson(): Record<string, unknown> {
    return {
      actionId: this.actionId,
      machineId: this.machineId,
      moduleIndex: this.moduleIndex,
      pickIndex: this.pickIndex,
      sequenceNumber: this.sequenceNumber,
      session: this.session,
      userId: this.userId,
      externalUserId: this.externalUserId,
    };
  }
}
