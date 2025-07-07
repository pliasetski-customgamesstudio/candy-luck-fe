export class Fullscreen {
  public static enterFullscreen(): Promise<void> {
    return document.documentElement.requestFullscreen();
  }

  public static exitFullscreen(): Promise<void> {
    return document.exitFullscreen();
  }

  public static toggleFullscreen(): Promise<void> {
    return this.isFullscreen ? this.exitFullscreen() : this.enterFullscreen();
  }

  public static get isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }
}
