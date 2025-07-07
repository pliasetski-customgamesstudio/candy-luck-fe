import { InternalBaseSpecGroup } from '@cgs/common';
import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';

export class BaseSpecGroupResponseConverter extends ResponseConverter<
  Record<string, any>,
  InternalBaseSpecGroup
> {
  ConvertObject(obj: Record<string, any>): InternalBaseSpecGroup {
    const result = new InternalBaseSpecGroup();
    result.type = obj['type'];
    return result;
  }
}
