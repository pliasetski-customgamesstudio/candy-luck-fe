import { PropertyType } from '@cgs/syd';

export class Convert {
  static changeType(value: any, type: PropertyType): any {
    if (typeof value === 'string') {
      if (type === PropertyType.Bool) {
        return value.toLowerCase() === 'true';
      }
      if (type === PropertyType.Int) {
        return parseInt(value);
      }
    }
    return value;
  }
}
