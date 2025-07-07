export enum DisableTouchTrigger {
  Auto = 'Auto',
  Attempts = 'Attempts',
}

export function parseDisableTouchTriggerEnum(value: string): DisableTouchTrigger {
  if (Object.values(DisableTouchTrigger).includes(value as DisableTouchTrigger)) {
    return value as DisableTouchTrigger;
  } else {
    throw new Error(`Error during parse ${value} to DisableTouchTrigger`);
  }
}
