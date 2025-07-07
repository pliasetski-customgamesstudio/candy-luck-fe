export type MethodBinding = () => void;
export type MethodInvokeFunction<ObjectType> = (o: ObjectType, p1?: object) => void;

export class MethodInfo<ObjectType> {
  private readonly _invoke: MethodInvokeFunction<ObjectType>;

  constructor(invoke: MethodInvokeFunction<ObjectType>) {
    this._invoke = invoke;
  }

  bind(obj: ObjectType, p1?: object): MethodBinding {
    return () => this._invoke(obj, p1);
  }
}
