import { IAlertManager } from './i_alert_manager';

export class AlertManager implements IAlertManager {
  private resourcePath: string = 'alert';
  private template: string | null = null;
  private translations: Record<string, any> | null = null;
  private unsubscribe: (() => void)[] = [];

  constructor(private resourceUrl: string) {
    if (!this.resourceUrl) {
      throw new Error('AlertManager requires resourceUrl!');
    }

    this.preloadData();
  }

  public show(title: string, text: string, reloadApp: boolean = false): void {
    if (!this.template || !this.translations) {
      return;
    }

    if (this.isAlertOpened) {
      this.closeAlert(false);
    }

    const dialogContainer = this.dialogContainer;

    if (dialogContainer) {
      const template = Handlebars.compile(this.template);
      dialogContainer.insertAdjacentHTML(
        'beforeend',
        template({ title, text, ...this.translations })
      );

      this.handleAlertClose(reloadApp);
    }
  }

  public showConnectionError(reloadApp: boolean = true): void {
    this.show(this.translations?.['error'], this.translations?.['connectionError'], reloadApp);
  }

  public showUnhandled(reloadApp: boolean = true): void {
    this.show(this.translations?.['error'], this.translations?.['somethingWentWrong'], reloadApp);
  }

  private get dialogContainer(): Element | null {
    return document.getElementById('dialogs');
  }

  private get alertElement(): Element | null {
    return document.getElementById('alert');
  }

  private get isAlertOpened(): boolean {
    return !!this.alertElement;
  }

  private handleAlertClose(reloadApp: boolean = false): void {
    const closeElement = document.getElementById('close-alert');
    const onClose = () => this.closeAlert(reloadApp);
    closeElement?.addEventListener('click', onClose);
    this.unsubscribe.push(() => closeElement?.removeEventListener('click', onClose));
  }

  private closeAlert(reloadApp: boolean = false): void {
    const alertElement = this.alertElement;
    alertElement && this.dialogContainer?.removeChild(this.alertElement);
    this.unsubscribe.forEach((callback) => callback());
    this.unsubscribe = [];

    if (reloadApp) {
      window.location.reload();
    }
  }

  private async preloadData(): Promise<void> {
    try {
      const templatePromise = fetch(this.getFilePath('template.hbs')).then((response) =>
        response.ok ? response.text() : null
      );
      const translationsPromise = fetch(this.getFilePath('translations.json')).then((response) =>
        response.ok ? response.json() : null
      );

      const [template, translations] = await Promise.all([templatePromise, translationsPromise]);

      this.template = template;
      this.translations = translations;
    } catch {
      //
    }
  }

  private getFilePath(path: string): string {
    return `${this.resourceUrl}/${this.resourcePath}/${path}`;
  }
}
