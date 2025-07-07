export type PropertySetFunction<TObject, TProperty> = (o: TObject, v: TProperty) => void;
export type PropertyBinding<TProperty> = (v: TProperty) => void;

export enum PropertyType {
  Vector2 = 1,
  Size = 12,
  Rect = 7,
  Bool = 6,
  Int = 2,
  Double = 0,
  String = 3,
  Color4 = 4,
  Color4i = 5,
  HorizontalAlignment = 8,
  VerticalAlignment = 9,
  DimensionSource = 10,
  DimensionSourceScale = 13,
  TextFormattingMode = 11,
}

export class PropertyInfo<TObject, TProperty> {
  type: PropertyType;
  parseType: PropertyType;
  defaultValue: TProperty;
  private readonly _set: PropertySetFunction<TObject, TProperty>;

  constructor(
    set: PropertySetFunction<TObject, TProperty>,
    defaultValue: TProperty,
    type: PropertyType,
    parseType: PropertyType = type
  ) {
    this.defaultValue = defaultValue;
    this._set = set;
    this.type = type;
    this.parseType = parseType || type;
  }

  /*getPropertyType(): PropertyType {
    switch (this.type) {
      case PropertyType.Vector2:
      case PropertyType.Size:
        return 'Vector2';
      case PropertyType.Int:
      case PropertyType.Double:
        return 'number';
      case PropertyType.Color4:
      case PropertyType.Color4i:
        return 'Color4';
        default:
          return undefined;
    }
  }*/

  bind(obj: TObject): PropertyBinding<TProperty> {
    return (v) => this._set(obj, v);
  }

  set(obj: TObject, value: TProperty): void {
    this._set(obj, value);
  }
}
