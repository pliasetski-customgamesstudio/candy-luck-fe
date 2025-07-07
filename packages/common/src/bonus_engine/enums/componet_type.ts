export enum ComponentType {
  ButtonSet = 'ButtonSet',
  Share = 'Share',
  SceneProvider = 'SceneProvider',
  RandomGenerator = 'RandomGenerator',
  CardsGenerator = 'CardsGenerator',
  CardColorSuitGenerator = 'CardColorSuitGenerator',
  HistoryItems = 'HistoryItems',
  Variables = 'Variables',
  Tutorial = 'Tutorial',
  Sender = 'Sender',
}

export function parseComponentTypeEnum(value: string): ComponentType {
  if (Object.values(ComponentType).includes(value as ComponentType)) {
    return value as ComponentType;
  } else {
    throw new Error(`Error during parse ${value} to ComponentType`);
  }
}
