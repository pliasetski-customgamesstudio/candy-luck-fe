import { ICanvasManager } from './i_canvas_manager';
import { PageInfo } from './page_info';

export class RootCanvasManager implements ICanvasManager {
  getPageInfo(): Promise<PageInfo> {
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement;
    return Promise.resolve(
      new PageInfo(
        canvas.width,
        canvas.height,
        window.pageXOffset,
        window.pageYOffset,
        window.scrollX,
        window.scrollY
      )
    );
  }

  scrollTo(x: number, y: number): void {
    window.scrollTo(x, y);
  }
}
