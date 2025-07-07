export class SharingConfig {
  private _fbNamespace: string;
  public actionName: string;
  public objectParamName: string;
  public type: string;
  public title: string;
  public description: string;
  public caption: string;
  public imageUrl: string;
  public sharingType: string;
  public giftToken: string;
  public params: Record<string, string> = {};
  public giftCount: string;
  public isUseSharingEnable: boolean = true;
  public supportsOpenGraph: boolean = true;

  constructor(fbNamespace: string) {
    this._fbNamespace = fbNamespace;
  }

  public addParam(key: string, value: string): void {
    this.params[`${this._fbNamespace}:${key}`] = value;
  }

  private covertKey(v: string, fbNamespace: string): string {
    return v.replace(`${fbNamespace}:`, '');
  }

  public toMap(fbNamespace: string): Record<string, string> {
    const res: Record<string, string> = { title: this.title };
    Object.entries(this.params).forEach(([k, v]) => {
      res[this.covertKey(k, fbNamespace)] = v;
    });
    return res;
  }
}
