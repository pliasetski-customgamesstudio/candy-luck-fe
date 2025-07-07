import { ResourceDescriptionBase } from './19_ResourceDescriptionBase';
import { ResourceSourceDescription } from './4_ResourceSourceDescription';

export class TextureResourceDescription extends ResourceDescriptionBase {
  private _textureSources: ResourceSourceDescription[];

  constructor(id: string, textureSources: ResourceSourceDescription[]) {
    super(id);
    this._textureSources = textureSources;
  }

  static fromXml(xml: HTMLElement): TextureResourceDescription {
    const id = xml.getAttribute('id')!;
    const singleUrl = xml.getAttribute('path');
    let textureSources: ResourceSourceDescription[];

    if (singleUrl) {
      textureSources = [new ResourceSourceDescription(singleUrl)];
    } else {
      textureSources = [];
      xml.childNodes.forEach((node) => {
        textureSources.push(ResourceSourceDescription.fromXml(node as HTMLElement));
      });
    }

    return new TextureResourceDescription(id, textureSources);
  }

  get textureSources(): ResourceSourceDescription[] {
    return this._textureSources;
  }
}
