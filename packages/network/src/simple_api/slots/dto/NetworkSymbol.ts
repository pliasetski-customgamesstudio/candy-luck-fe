import { FeatureParametrs } from './FeatureParametrs';

export class NetworkSymbol {
  customName: string | null;
  featureParametrs: FeatureParametrs | null; // Ensure this export class has a fromJson method if it's a custom export class.
  freeSpinGains: number[] | null;
  freeSpinTypeGains: number[] | null;
  gains: number[] | null;
  id: number | null;
  stacked: number | null;
  type: string | null;
  typeGains: number[] | null;

  constructor({
    customName,
    featureParametrs,
    freeSpinGains,
    freeSpinTypeGains,
    gains,
    id,
    stacked,
    type,
    typeGains,
  }: {
    customName: string | null;
    featureParametrs: FeatureParametrs | null;
    freeSpinGains: number[] | null;
    freeSpinTypeGains: number[] | null;
    gains: number[] | null;
    id: number | null;
    stacked: number | null;
    type: string | null;
    typeGains: number[] | null;
  }) {
    this.customName = customName;
    this.featureParametrs = featureParametrs;
    this.freeSpinGains = freeSpinGains;
    this.freeSpinTypeGains = freeSpinTypeGains;
    this.gains = gains;
    this.id = id;
    this.stacked = stacked;
    this.type = type;
    this.typeGains = typeGains;
  }

  static fromJson(json: { [key: string]: any }): NetworkSymbol {
    return new NetworkSymbol({
      customName: json['customName'],
      featureParametrs: json['featureParametrs']
        ? FeatureParametrs.fromJson(json['featureParametrs'])
        : null,
      freeSpinGains: json['freeSpinGains'] ? json['freeSpinGains'] : null,
      freeSpinTypeGains: json['freeSpinTypeGains'] ? json['freeSpinTypeGains'] : null,
      gains: json['gains'] ? json['gains'] : null,
      id: json['id'],
      stacked: json['stacked'],
      type: json['type'],
      typeGains: json['typeGains'] ? json['typeGains'] : null,
    });
  }
}
