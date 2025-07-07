// import { SceneObject } from "@cgs/shared";
// import { IocContainer } from 'func2';
//
// class LazyNodeHolder extends SceneObject {
//   private _container: () => IocContainer;
//   private _isInit: boolean = false;
//
//   constructor(container: () => IocContainer) {
//     super();
//     this._container = container;
//   }
//
//   initIfNeed(): void {
//     if (this._isInit) return;
//     this.init();
//   }
//
//   init(): void {
//     const container = this._container();
//     this.initInternal(container);
//     this._isInit = true;
//   }
//
//   deinit(): void {
//     for (const child of this.childs) {
//       child.deinitialize();
//     }
//
//     this.childs.clear();
//
//     this._isInit = false;
//   }
//
//   initInternal(container: IocContainer): void {}
// }
