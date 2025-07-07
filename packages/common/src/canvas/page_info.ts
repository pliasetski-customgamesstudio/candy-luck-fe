export class PageInfo {
  clientHeight: number;
  clientWidth: number;
  offsetLeft: number;
  offsetTop: number;
  scrollLeft: number;
  scrollTop: number;

  constructor(
    clientWidth: number,
    clientHeight: number,
    offsetLeft: number,
    offsetTop: number,
    scrollLeft: number,
    scrollTop: number
  ) {
    this.clientWidth = clientWidth;
    this.clientHeight = clientHeight;
    this.offsetLeft = offsetLeft;
    this.offsetTop = offsetTop;
    this.scrollLeft = scrollLeft;
    this.scrollTop = scrollTop;
  }
}
