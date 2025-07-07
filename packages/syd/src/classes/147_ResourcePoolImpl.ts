import { Resource } from './8_Resource';
import { ResourcePool } from './90_ResourcePool';
import { IMediaContainer } from './1_IMediaContainer';

export abstract class ResourcePoolImpl<
  ResourceType extends Resource<DataType>,
  DataType,
> extends ResourcePool<ResourceType> {
  abstract loadData(data: string): DataType;

  public get requiresMediaContainer(): boolean {
    return false;
  }

  loadResourceData(
    resource: ResourceType,
    xml: HTMLElement,
    _: IMediaContainer | null
  ): Promise<void> {
    const result = this.loadData(xml.textContent!);
    resource.construct(result);
    return Promise.resolve();
  }
}
