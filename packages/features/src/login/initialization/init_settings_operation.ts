import { SyncOperationBase } from '@cgs/common';
import { IAppSettings } from '@cgs/common';
import { IOperationContext } from '@cgs/common';

export class InitSettingsOperation extends SyncOperationBase {
  private _appSettings: IAppSettings;

  constructor(context: IOperationContext, appSettings: IAppSettings) {
    super(context);
    this._appSettings = appSettings;
  }

  public internalExecute(): void {
    this._appSettings.init();
  }
}
