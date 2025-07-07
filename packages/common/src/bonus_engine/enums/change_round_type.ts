export enum ChangeRoundType {
  Next = 'Next',
  Specific = 'Specific',
}

export function parseChangeRoundTypeEnum(value: string): ChangeRoundType {
  if (Object.values(ChangeRoundType).includes(value as ChangeRoundType)) {
    return value as ChangeRoundType;
  } else {
    throw new Error(`Error during parse ${value} to ChangeRoundType`);
  }
}
