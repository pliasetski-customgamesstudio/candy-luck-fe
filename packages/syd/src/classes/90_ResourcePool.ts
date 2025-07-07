import { ResourceBase } from './8_Resource';
import { IMediaContainer } from './1_IMediaContainer';

export abstract class ResourcePool<ResourceType extends ResourceBase> {
  private _resources: Map<string, ResourceType> = new Map<string, ResourceType>();
  public get resources(): Map<string, ResourceType> {
    return this._resources;
  }

  public abstract get requiresMediaContainer(): boolean;

  public abstract loadResourceData(
    resource: ResourceType,
    xml: Element,
    container: IMediaContainer | null
  ): Promise<void>;

  public abstract createResource(resourceId: string): ResourceType;

  public create(resourceId: string): ResourceType {
    if (this._resources.has(resourceId)) {
      console.error(`Resource with id ${resourceId} already exists.`);
      // TODO: узнать что делать с assert
      // throw new Error(`Resource with id ${resourceId} already exists.`);
    }

    const resource: ResourceType = this.createResource(resourceId);
    this._resources.set(resourceId, resource);

    return resource;
  }

  public unload(resource: ResourceType): void {
    if (!this._resources.has(resource.id)) {
      throw new Error(`Resource with id ${resource.id} does not exist.`);
    }

    resource.destroy();
    this._resources.delete(resource.id);
  }

  public getResource(resourceId: string): ResourceType | undefined {
    return this._resources.get(resourceId);
  }

  public contextLost(): void {}

  public contextReady(): Promise<void> {
    return Promise.resolve();
  }
}
