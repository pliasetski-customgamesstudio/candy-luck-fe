export enum RoundMessageType {
  Init = 'Init',
  Start = 'Start',
  Restore = 'Restore',
  Win = 'Win',
  Lose = 'Lose',
  Finish = 'Finish',
  None = 'None',
  Click = 'Click',
  Hide = 'Hide',
  Show = 'Show',
  AfterWin = 'AfterWin',
}

export function parseRoundMessageTypeEnum(value: string): RoundMessageType {
  if (Object.values(RoundMessageType).includes(value as RoundMessageType)) {
    return value as RoundMessageType;
  } else {
    throw new Error(`Error during parse ${value} to RoundMessageType`);
  }
}
