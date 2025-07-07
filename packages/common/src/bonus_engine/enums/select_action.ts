export enum SelectAction {
  SendIndex = 'SendIndex',
  SendValue = 'SendValue',
  FinishRound = 'FinishRound',
  InterruptRound = 'InterruptRound',
  None = 'None',
}

export function parseSelectActionEnum(value: string): SelectAction {
  if (Object.values(SelectAction).includes(value as SelectAction)) {
    return value as SelectAction;
  } else {
    throw new Error(`Error during parse ${value} to SelectAction`);
  }
}
