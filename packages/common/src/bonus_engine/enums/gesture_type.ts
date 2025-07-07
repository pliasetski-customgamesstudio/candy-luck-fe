export enum GestureType {
  Click = 'Click',
}

export function parseGestureTypeEnum(value: string): GestureType {
  if (Object.values(GestureType).includes(value as GestureType)) {
    return value as GestureType;
  } else {
    throw new Error(`Error during parse ${value} to GestureType`);
  }
}
