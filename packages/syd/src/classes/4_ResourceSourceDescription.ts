export class ResourceSourceDescription {
  static fromXml(xml: HTMLElement): ResourceSourceDescription {
    const url = xml.getAttribute('path')?.replace(' ', '%20') ?? '';
    const type = xml.getAttribute('type') ?? '';
    return new ResourceSourceDescription(url, type);
  }

  private _url: string;
  private _type?: string;

  constructor(url: string, type?: string) {
    this._url = url;
    this._type = type;
  }

  get url(): string {
    return this._url;
  }

  get type(): string | undefined {
    return this._type;
  }
}
