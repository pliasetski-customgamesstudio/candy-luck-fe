import { IMediaContainer } from './1_IMediaContainer';

export class MediaContainer implements IMediaContainer {
  private _iframeObject: any;
  private _iframe: HTMLElement | null = null;

  constructor(htmlElement: HTMLElement) {
    this._iframe = htmlElement;
    this._iframeObject = htmlElement;
  }

  appendToContainer(element: HTMLElement): void {
    const frame = this._iframeObject;
    if (frame) {
      frame.contentDocument.body.appendChild(element);
    } else {
      document.body.appendChild(element);
      console.error('Not able to append video to media container, use html body instead');
    }
  }

  isValidContainer(): boolean {
    const frame = this._iframeObject;
    return !(!!frame || !frame.contentDocument || !frame.contentDocument.body);
  }

  getCountOfMediaElements(): number {
    const frame = this._iframeObject;
    if (!this.isValidContainer()) {
      return -1;
    }
    return parseFloat(frame.contentDocument.body.children.length.toString());
  }

  remove(): void {
    if (this._iframe) {
      this._iframe.remove();
      this._iframe = null;
    }
    this._iframeObject = null;
  }
}
