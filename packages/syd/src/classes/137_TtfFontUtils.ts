export class TtfFontUtils {
  private _styleSheet: CSSStyleSheet;
  private _divFontPreloader: HTMLDivElement;
  private _webPath: string = '';
  private _fontFamilies: string[] = [];
  private _system: string[] = ['arial', 'verdana', 'tahoma', 'times new roman'];

  constructor() {
    document.head.append(document.createElement('style'));
    this._styleSheet = document.styleSheets[document.styleSheets.length - 1] as CSSStyleSheet;

    this._divFontPreloader = document.createElement('div');
    this._divFontPreloader.style.overflow = 'hidden';
    this._divFontPreloader.style.height = '0';
    document.body.appendChild(this._divFontPreloader);
  }

  registerFontFromXml(xml: Element): void {
    const fonts: { [key: string]: string } = {};
    let el: Element;

    for (let i = 0; i < xml.childNodes.length; i++) {
      el = xml.childNodes[i] as Element;
      fonts[el.nodeName] = el.getAttribute('path')!;
    }

    const fontFamily = TtfFontUtils.getFontFamily(fonts['ttf']);
    if (this.isSystemFont(fontFamily) || this.isExist(fontFamily)) {
      return;
    }

    let rule = `@font-face { font-family: '${fontFamily}'; src: `;
    if (Object.prototype.hasOwnProperty.call(fonts, 'eot')) {
      rule += `url('${this.getWebPath(fonts['eot'], 'eot')}?') format('eot'), `;
    }
    if (Object.prototype.hasOwnProperty.call(fonts, 'woff')) {
      rule += `url('${this.getWebPath(fonts['woff'], 'woff')}') format('woff'), `;
    }
    rule += `url('${this.getWebPath(fonts['ttf'], 'ttf')}') format('truetype'); }`;
    this._registerFont(rule, fontFamily);
  }

  registerFontFromPath(path: string): void {
    const fontFamily = TtfFontUtils.getFontFamily(path);

    if (this.isSystemFont(fontFamily) || this.isExist(fontFamily)) {
      return;
    }

    const rule =
      `@font-face {` +
      `font-family: '${fontFamily}'; src: url('${this.getWebPath(path, 'eot')}?') format('eot'), ` +
      `url('${this.getWebPath(path, 'woff')}') format('woff'), ` +
      `url('${this.getWebPath(path, 'ttf')}') format('truetype'); }`;
    this._registerFont(rule, fontFamily);
  }

  private _registerFont(rule: string, fontFamily: string): void {
    console.log(rule);

    this._styleSheet.insertRule(rule, 0);

    const div = document.createElement('div');
    div.setAttribute('style', `font-family: '${fontFamily}';`);
    div.innerHTML = '&nbsp;';
    this._divFontPreloader.appendChild(div);

    this._fontFamilies.push(fontFamily);
  }

  private static getFileName(path: string): string {
    return path.split('/').pop()!;
  }

  private static removeExtension(str: string): string {
    return str.replace(/\.[^.]+$/, '');
  }

  private getWebPath(path: string, extension: string): string {
    return this._webPath + TtfFontUtils.removeExtension(path) + '.' + extension;
  }

  public static getFontFamily(path: string): string {
    path = TtfFontUtils.getFileName(path);
    const list = path.split('.');
    if (list.length > 2) {
      path = path.replace(/[^.]+./, '');
    }

    return TtfFontUtils.removeExtension(path);
  }

  private isSystemFont(fontFamily: string): boolean {
    return this._system.includes(fontFamily.toLowerCase());
  }

  private isExist(fontFamily: string): boolean {
    return this._fontFamilies.includes(fontFamily);
  }
}
