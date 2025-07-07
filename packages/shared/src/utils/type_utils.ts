import { Constructor } from '@cgs/syd';

export class TypeUtils {
  static typeof<T extends Constructor<any>>(object: T): T {
    return object.constructor as T;
  }
}
