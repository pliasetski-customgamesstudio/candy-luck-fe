import { IController } from './i_controller';

export const T_IControllerRegistry = Symbol('IControllerRegistry');
export interface IControllerRegistry {
  getActiveControllers(): IController[];
  registerController(controller: IController): void;
  unregisterController(controller: IController): void;
}

export class ControllerRegistry implements IControllerRegistry {
  private _activeControllers: IController[] = [];

  getActiveControllers(): IController[] {
    return [...this._activeControllers];
  }

  registerController(controller: IController): void {
    this._activeControllers.push(controller);
  }

  unregisterController(controller: IController): void {
    const index = this._activeControllers.indexOf(controller);
    if (index !== -1) {
      this._activeControllers.splice(index, 1);
    }
  }
}
