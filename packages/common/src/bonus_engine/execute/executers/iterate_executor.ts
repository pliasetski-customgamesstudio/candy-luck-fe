import { IExecuteData } from './i_execute_data';
import { IMessageContext } from '../i_message_context';
import { SceneObject } from '@cgs/syd';
import { CancellationToken } from '../../../future/cancellation_token';
import { ConfigConstants } from '../../configuration/config_constants';

export abstract class IterateExecutor implements IExecuteData {
  private readonly _unresolvedParams: Record<string, string | null>;
  private _resolvedParams: Record<string, string[]>;

  constructor(paramList: Record<string, string | null>) {
    this._unresolvedParams = paramList;
  }

  get MaxValuesCount(): number {
    return Object.values(this._resolvedParams).reduce(
      (prev, values) => (values.length > prev ? values.length : prev),
      0
    );
  }

  async play(
    context: IMessageContext,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void> {
    this._resolvedParams = this.processCurvedParams(this._unresolvedParams, context);

    if (Object.values(this._resolvedParams).every((list) => list.length > 0)) {
      const iteratedValues: Record<string, string>[] = [];
      for (let i = 0, n = this.MaxValuesCount; i < n; i++) {
        iteratedValues.push(this.iterateValues(i));
      }

      let parallelTasks: Promise<void>[] | null = null;

      for (const values of iteratedValues) {
        let sb = `${new Date()}: `;
        Object.entries(values).forEach(([key, value]) => (sb += `${key}: ${value}, `));
        console.log(sb);

        if (values[ConfigConstants.executionType] === 'Parallel') {
          const task = this.iteratePlay(context, values, roots, token);
          parallelTasks = parallelTasks ?? [];
          parallelTasks.push(task);
        } else {
          await this.iteratePlay(context, values, roots, token);
          token.throwIfCancellationRequested();
        }
      }

      if (parallelTasks) {
        await Promise.all(parallelTasks);
        token.throwIfCancellationRequested();
      }
    } else {
      let sb = `${new Date()}: Could not resolve properties:`;
      Object.entries(this._resolvedParams).forEach(([key, value]) => {
        if (value.length === 0) {
          sb += ` ${key}: ${this._unresolvedParams[key]},`;
        }
      });
      console.log(sb);
    }

    return Promise.resolve();
  }

  iterateValues(i: number): Record<string, string> {
    const result: Record<string, string> = {};
    Object.entries(this._resolvedParams).forEach(([key, value]) => {
      result[key] = i < value.length ? value[i] : value[value.length - 1];
    });
    return result;
  }

  processCurvedParams(
    paramsList: Record<string, string | null>,
    context: IMessageContext
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    Object.entries(paramsList).forEach(([key, value]) => {
      if (value) {
        result[key] = context.resolve(value);
      }
    });
    return result;
  }

  abstract iteratePlay(
    context: IMessageContext,
    paramsList: Record<string, string>,
    roots: SceneObject[],
    token: CancellationToken
  ): Promise<void>;
}
