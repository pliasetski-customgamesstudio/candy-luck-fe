export const T_AlertManager = Symbol('IAlertManager');

export interface IAlertManager {
  show(title: string, text: string, reloadApp?: boolean): void;
  showConnectionError(reloadApp?: boolean): void;
  showUnhandled(reloadApp?: boolean): void;
}
