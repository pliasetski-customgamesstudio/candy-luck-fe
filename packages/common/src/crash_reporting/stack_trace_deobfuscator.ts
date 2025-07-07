/*
import { HttpClient, HttpException } from '@cgs/network';
import { Logger } from '@cgs/shared';
import { Mapping, SingleMapping, mapStackTrace, terse } from 'source-maps';
import { Duration } from '@cgs/shared';
import { jsonDecode } from 'dart:convert';

export class StackTraceDeobfuscator {
  private _sourceMap: Mapping;

  constructor() {}

  get successfullyInitialized(): boolean {
    return !!this._sourceMap;
  }

  async init(sourceMapUrl: string): Promise<void> {
    const httpClient = new HttpClient();
    const sourceMapText = await this._tryGetSourceMap(httpClient, sourceMapUrl, 3);
    if (sourceMapText) {
      try {
        const map = jsonDecode(sourceMapText);
        this._sourceMap = new SingleMapping.fromJson(map);
      } catch (e) {
        this._sourceMap = null;
      }
    } else {
      this._sourceMap = null;
    }
  }

  private async _tryGetSourceMap(
    httpClient: HttpClient,
    sourceMapUrl: string,
    retryAttempts: number
  ): Promise<string> {
    let result: string = null;
    try {
      result = await httpClient.getString(sourceMapUrl, new Duration({ seconds: 40 }));
    } catch (e) {
      if (retryAttempts > 0) {
        retryAttempts--;
        result = await this._tryGetSourceMap(httpClient, sourceMapUrl, retryAttempts);
      } else {
        Logger.Info("Can't initialize StackTraceDeobfuscator");
      }
    }

    return result;
  }

  convert(stackTrace: StackTrace): StackTrace {
    return terse(mapStackTrace(this._sourceMap, stackTrace, { minified: true }));
  }
}
*/
