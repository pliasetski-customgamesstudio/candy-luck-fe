export enum RoundType {
  Scene = 'Scene',
  Popup = 'Popup',
  Animation = 'Animation',
}

export function parseRoundTypeEnum(value: string): RoundType {
  if (Object.values(RoundType).includes(value as RoundType)) {
    return value as RoundType;
  } else {
    throw new Error(`Error during parse ${value} to RoundType`);
  }
}
