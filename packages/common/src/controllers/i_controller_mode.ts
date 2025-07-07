export interface IControllerMode {
  initialize(): void;
  setup(): void;
  enter(): Promise<void>;
  exit(): Promise<void>;
  tearDown(): void;
  destroy(): void;
}

// export abstract class IControllerModeWithParametrizedEnter<TParameter> {
//   abstract enterWithParam(param: TParameter): Promise<boolean>;
// }
