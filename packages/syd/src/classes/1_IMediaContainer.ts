export interface IMediaContainer {
  appendToContainer(html: HTMLElement): void;

  getCountOfMediaElements(): number;

  isValidContainer(): boolean;

  remove(): void;
}
