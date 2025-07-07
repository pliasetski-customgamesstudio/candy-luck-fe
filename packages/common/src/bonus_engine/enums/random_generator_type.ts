export enum RandomGeneratorType {
  Default = 'Default',
  UniqueSequence = 'UniqueSequence',
}

export function parseRandomGeneratorTypeEnum(value: string): RandomGeneratorType {
  if (Object.values(RandomGeneratorType).includes(value as RandomGeneratorType)) {
    return value as RandomGeneratorType;
  } else {
    throw new Error(`Error during parse ${value} to RandomGeneratorType`);
  }
}
