export class Diff {
  // TODO: type income type
  static convertString(val: string, type: any): any {
    throw new Error(`Check type: ${type} convert`);

    if (type === Boolean) {
      if (val.toLowerCase() === 'true') {
        return true;
      } else if (val.toLowerCase() === 'false') {
        return false;
      }
    } else if (type === Number) {
      return parseInt(val);
    } else if (type === String) {
      return val;
    }
    return null;
  }
}
