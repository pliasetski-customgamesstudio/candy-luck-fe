import { ResourcePoolImpl } from './147_ResourcePoolImpl';
import { ShaderSourceResource } from './74_ShaderSourceResource';

export class ShaderSourceResourcePool extends ResourcePoolImpl<ShaderSourceResource, string> {
  createResource(resourceId: string): ShaderSourceResource {
    return new ShaderSourceResource(resourceId);
  }

  loadData(data: string): string {
    return data;
  }
}
