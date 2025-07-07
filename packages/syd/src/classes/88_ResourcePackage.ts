import { ResourceBase } from './8_Resource';

export class ResourcePackage {
  public readonly resources: ResourceBase[];
  private _resourcePath: string;

  constructor(resources: ResourceBase[]) {
    this.resources = resources;
  }

  get resourcePath(): string {
    return this._resourcePath;
  }

  set resourcePath(value: string) {
    this._resourcePath = value;
  }
}
