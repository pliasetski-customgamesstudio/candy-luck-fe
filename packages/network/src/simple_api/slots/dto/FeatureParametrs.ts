export class FeatureParametrs {
  collectCount: number | null;
  collectGain: number | null;
  collectIndex: number | null;
  featureName: string | null;
  featuresNames: string[] | null;
  switchSymbol: number | null;
  type: string | null;
  weight: number | null;

  constructor({
    collectCount,
    collectGain,
    collectIndex,
    featureName,
    featuresNames,
    switchSymbol,
    type,
    weight,
  }: {
    collectCount: number | null;
    collectGain: number | null;
    collectIndex: number | null;
    featureName: string | null;
    featuresNames: string[] | null;
    switchSymbol: number | null;
    type: string | null;
    weight: number | null;
  }) {
    this.collectCount = collectCount;
    this.collectGain = collectGain;
    this.collectIndex = collectIndex;
    this.featureName = featureName;
    this.featuresNames = featuresNames || [];
    this.switchSymbol = switchSymbol;
    this.type = type;
    this.weight = weight;
  }

  static fromJson(json: { [key: string]: any }): FeatureParametrs {
    return new FeatureParametrs({
      collectCount: json['collectCount'] ?? null,
      collectGain: json['collectGain'] ?? null,
      collectIndex: json['collectIndex'] ?? null,
      featureName: json['featureName'] ?? null,
      featuresNames: json['featuresNames'] ?? null,
      switchSymbol: json['switchSymbol'] ?? null,
      type: json['type'] ?? null,
      weight: json['weight'] ?? null,
    });
  }
}
