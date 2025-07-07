import { Logger } from '@cgs/shared';

export class HttpUtil {
  static async wrapWithLogError<T = any>(request: Promise<T>, url: string): Promise<T> {
    try {
      return await request;
    } catch (e) {
      Logger.Error(`HttpRequest failed: ${url}`);
      throw e;
    }
  }
}
