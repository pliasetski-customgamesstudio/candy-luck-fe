export class ViewInfo {
  ResourceId: string;
  PackagePath: string;

  constructor(PackagePath: string, ResourceId: string) {
    this.PackagePath = PackagePath;
    this.ResourceId = ResourceId;
  }
}
