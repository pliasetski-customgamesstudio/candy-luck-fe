import { ResourcePoolImpl } from './147_ResourcePoolImpl';
import { JSONResource } from './39_JSONResource';

export class JSONResourcePool extends ResourcePoolImpl<JSONResource, Record<string, any>> {
  createResource(resourceId: string): JSONResource {
    return new JSONResource(resourceId);
  }

  loadData(data: string): Map<string, any> {
    return JSON.parse(data);
  }
}
