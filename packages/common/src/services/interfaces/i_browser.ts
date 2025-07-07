export interface IBrowser {
  openUrl(url: string): void;
}

export class Browser implements IBrowser {
  openUrl(url: string): void {
    window.open(url, '_blank');
  }
}
