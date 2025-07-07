type TranslationsData = Record<string, any>;

export class Translations {
  public isLoaded: boolean = false;

  private _translations: TranslationsData = {};
  private _translationsPromise: Promise<Record<string, any>>;

  constructor(
    private resourceUrl: string,
    private resourcePath: string
  ) {
    if (!this.resourceUrl || !this.resourcePath) {
      throw new Error('Translations requires resourceUrl and resourcePath!');
    }

    this.loadData();
  }

  public get data(): TranslationsData {
    return this._translations;
  }

  public get dataPromise(): Promise<TranslationsData> {
    return this._translationsPromise;
  }

  public get(key: string): any {
    return this._translations[key] || '';
  }

  public getAsync(key: string): Promise<any> {
    return this._translationsPromise.then((translations) => translations[key] || '');
  }

  private loadData(): void {
    this._translationsPromise = fetch(this.getFilePath())
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}));

    this._translationsPromise.then((translations) => {
      this._translations = translations;
      this.isLoaded = true;
    });
  }

  private getFilePath(): string {
    return `${this.resourceUrl}/${this.resourcePath}`;
  }
}
