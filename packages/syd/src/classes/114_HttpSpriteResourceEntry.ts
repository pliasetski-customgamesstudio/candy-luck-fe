import { HttpSpriteResource } from './168_HttpSpriteResource';

export class HttpSpriteResourceEntry {
  readonly resource: HttpSpriteResource;
  priority: number = 0;

  constructor(resource: HttpSpriteResource) {
    this.resource = resource;
  }
}
