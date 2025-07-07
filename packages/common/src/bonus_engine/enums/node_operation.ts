export enum NodeOperation {
  Relocate = 'Relocate',
  Remove = 'Remove',
  RemoveAllChildren = 'RemoveAllChildren',
  SyncVideoStart = 'SyncVideoStart',
}

export function parseNodeOperationEnum(value: string): NodeOperation {
  if (Object.values(NodeOperation).includes(value as NodeOperation)) {
    return value as NodeOperation;
  } else {
    throw new Error(`Error during parse ${value} to NodeOperation`);
  }
}
