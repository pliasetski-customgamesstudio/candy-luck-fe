export abstract class IAnalyticsProcessor {
  abstract add(value: number): void;

  abstract postprocess(key: string, props: Map<string, string>): void;
}
