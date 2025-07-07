import { ISpinResponse } from '@cgs/common';
import { LazyAction, LazyActionFactory } from '@cgs/shared';
import {
  State,
  Action,
  EmptyAction,
  SequenceSimpleAction,
  ParallelSimpleAction,
  Log,
} from '@cgs/syd';
import { ResponseHolder } from '../response_holder';

export class BaseGameState<TResponse extends ISpinResponse> extends State {
  private _responseHolder: ResponseHolder<TResponse>;
  public get responseHolder(): ResponseHolder<TResponse> {
    return this._responseHolder;
  }
  public animation: Action;
  public id: string;

  constructor(responseHolder: ResponseHolder<TResponse>, id: string) {
    super();
    this._responseHolder = responseHolder;
    this.id = id;
    this.animation = new EmptyAction();
  }

  public setLazyAnimation(factory: LazyActionFactory): void {
    this.animation = new LazyAction(() => factory());
  }

  public appendLazyAnimation(factory: LazyActionFactory): void {
    const action = this.animation;
    this.animation = new SequenceSimpleAction([action, new LazyAction(() => factory())]);
  }

  public addLazyAnimationToBegin(factory: LazyActionFactory): void {
    const action = this.animation;
    this.animation = new SequenceSimpleAction([new LazyAction(() => factory()), action]);
  }

  public addParallelLazyAnimation(factory: LazyActionFactory): void {
    const action = this.animation;
    this.animation = new ParallelSimpleAction([action, new LazyAction(() => factory())]);
  }

  public get isFinished(): boolean {
    return this.animation ? this.animation.isDone : true;
  }

  public isActive(stateId: string): boolean {
    if (this.id === stateId) {
      return true;
    }
    return false;
  }

  public findById(id: string): State | null {
    if (this.id === id) {
      return this;
    }
    return null;
  }

  public onEnterImpl(): void {
    Log.Trace(`Enter to ${this.id}`);
    if (this.animation) {
      this.animation.begin();
    }
  }

  public onLeaveImpl(): void {
    Log.Trace(`Leave from ${this.id}`);
    if (this.animation) {
      this.animation.end();
    }
  }

  public update(dt: number): void {
    if (this.animation) {
      this.animation.update(dt);
    }
  }

  public interrupt(): void {
    if (this.animation) {
      this.animation.end();
    }
  }

  public toString(): string {
    return `{id: ${this.id}}`;
  }
}
