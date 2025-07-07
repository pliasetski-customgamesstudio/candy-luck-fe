import { OperationControllerBase } from './operation_controller_base';
import { EventDispatcher, EventStream, SceneObject } from '@cgs/syd';
import { IOperation } from '../operations/i_operation';
import { IControllerMode } from './i_controller_mode';
import { IocContainer } from '@cgs/shared';

export abstract class IModeController {
  abstract enterMode(type: any): Promise<void>;
  abstract initModes(): void;
  abstract exitCurrentMode(): Promise<void>;
  abstract get currentMode(): IControllerMode | null;

  abstract get enteredMode(): EventStream<IControllerMode>;
  abstract get exitedMode(): EventStream<IControllerMode>;
}

export abstract class ModeOperationControllerBase<
    TOperation extends IOperation,
    TView extends SceneObject,
  >
  extends OperationControllerBase<TOperation, TView>
  implements IModeController
{
  private _container: IocContainer;
  private _states: Map<any, IControllerMode> = new Map<any, IControllerMode>();
  private _currentMode: IControllerMode | null;
  private _modes: any[];
  get modes(): any[] {
    return this._modes;
  }
  get currentMode(): IControllerMode | null {
    return this._currentMode;
  }

  private _enteredMode: EventDispatcher<IControllerMode> = new EventDispatcher<IControllerMode>();
  private _exitedMode: EventDispatcher<IControllerMode> = new EventDispatcher<IControllerMode>();

  get enteredMode(): EventStream<IControllerMode> {
    return this._enteredMode.eventStream;
  }
  get exitedMode(): EventStream<IControllerMode> {
    return this._exitedMode.eventStream;
  }

  constructor(view: TView, operation: TOperation, container: IocContainer) {
    super(view, operation);
    this._container = container;
  }

  protected onEnteringMode(_controllerMode: IControllerMode): void {}
  protected onExitingMode(_controllerMode: IControllerMode): void {}

  initModes(): void {
    for (const stateType of this._modes) {
      const controllerState: IControllerMode = this._container.resolve(stateType, [this])!;
      controllerState.initialize();
      this._states.set(stateType, controllerState);
    }
  }

  enterModeWithParam<TParameter>(type: any, _param: TParameter): Promise<void> {
    // let state = this._states.get(type);
    // if (state instanceof IControllerModeWithParametrizedEnter) {
    //   return this.enterModeInner(type, (st) => (st as IControllerModeWithParametrizedEnter<TParameter>).enterWithParam(param));
    // }

    return this.enterMode(type);
  }

  enterMode(type: any): Promise<void> {
    return this.enterModeInner(type, (st) => st.enter());
  }

  private async enterModeInner(
    type: any,
    enterFunc: (st: IControllerMode) => Promise<void>
  ): Promise<void> {
    const state = this._states.get(type)!;

    if (this.currentMode && this.currentMode === state) {
      return;
    }

    this.onEnteringMode(state);

    state.setup();
    await this.executeSafe(() => enterFunc(state));
    if (this.currentMode) {
      this.onExitingMode(this.currentMode);
      await this.executeSafe(this.currentMode.exit);
      this.currentMode.tearDown();
    }
    this._currentMode = state;

    this._enteredMode.dispatchEvent(this.currentMode!);
    this.onEnteredMode(this.currentMode);
  }

  protected onEnteredMode(_currentMode: IControllerMode | null): void {}

  async exitCurrentMode(): Promise<void> {
    if (!this.currentMode) {
      return;
    }

    this.onExitingMode(this.currentMode);
    this.currentMode.tearDown();
    await this.executeSafe(this.currentMode.exit);
    this._exitedMode.dispatchEvent(this.currentMode);
    this._currentMode = null;
    this.onEnteredMode(null);
  }

  onStop(): void {
    this._states.forEach((controllerState) => {
      if (this.currentMode == controllerState) {
        controllerState.tearDown();
      }
      controllerState.destroy();
    });
  }
}
