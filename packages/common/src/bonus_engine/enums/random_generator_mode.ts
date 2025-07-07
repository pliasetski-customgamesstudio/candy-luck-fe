export enum RandomGeneratorMode {
  Auto = 'Auto',
  Manual = 'Manual',
}

export function parseRandomGeneratorModeEnum(value: string): RandomGeneratorMode {
  if (Object.values(RandomGeneratorMode).includes(value as RandomGeneratorMode)) {
    return value as RandomGeneratorMode;
  } else {
    throw new Error(`Error during parse ${value} to RandomGeneratorMode`);
  }
}
