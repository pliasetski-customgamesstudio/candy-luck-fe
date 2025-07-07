import { ResponseConverter } from '../../../../reels_engine/reel_net_api/response_converter';
import { InternalJackpotsSpecGroup } from '@cgs/common';

export class JackpotsGroupResponseConverter
  implements ResponseConverter<Record<string, any>, InternalJackpotsSpecGroup>
{
  ConvertObject(group: Record<string, any>): InternalJackpotsSpecGroup {
    const result = new InternalJackpotsSpecGroup();
    result.jackPotInitialValues = (group['dJackPotInitialValues'] as number[]).slice();
    result.jackPotValues = (group['dJackPotValues'] as number[]).slice();
    result.targetCollectCount = group['targetCollectCount'];
    return result;
  }
}
