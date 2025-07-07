export enum ConditionOperation {
  Equality = 'Equality',
  Inequality = 'Inequality',
  Contains = 'Contains',
  Belongs = 'Belongs',
  IsAny = 'IsAny',
  IsEmpty = 'IsEmpty',
}

export function parseConditionOperationEnum(value: string): ConditionOperation {
  if (Object.values(ConditionOperation).includes(value as ConditionOperation)) {
    return value as ConditionOperation;
  } else {
    throw new Error(`Error during parse ${value} to ConditionOperation`);
  }
}
