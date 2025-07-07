// import { ICrashReporter } from './i_crash_reporter';
// import { AzureInsights, AzureAppSettings } from './azure_insights_wrapper';
// import { Cookies, Logger } from '@cgs/shared';
// import { v4 as uuidv4 } from 'uuid';
// import { UserInfoHolder } from '../services/user_info_holder';

// export class AzureInsightsCrashReporter implements ICrashReporter {
//   private static readonly userUuidKey: string = 'userUuid';
//   private readonly _azureInsights: AzureInsights;
//   private _userUuid: string = 'unknown';

//   constructor(azureInstrumentalKey: string, version: string) {
//     this._azureInsights = new AzureInsights(
//       new AzureAppSettings({ appId: azureInstrumentalKey, version: version })
//     );
//     this.initUserUuid();
//   }

//   private initUserUuid(): void {
//     let uuid = Cookies.get(AzureInsightsCrashReporter.userUuidKey);
//     if (!uuid) {
//       uuid = uuidv4();
//       Cookies.set(AzureInsightsCrashReporter.userUuidKey, uuid);
//     }
//     this._userUuid = uuid;
//     Logger.Info(`User UUID: ${this._userUuid}`);
//   }

//   public reportCrash(message: string, stackTrace: any): void {
//     const stackTraceText = stackTrace ? stackTrace.toString() : 'No StackTrace';
//     const userId = UserInfoHolder.userId;
//     this._azureInsights.sendAzureError(
//       message,
//       stackTraceText,
//       Logger.GetHistory(),
//       true,
//       userId ?? this._userUuid
//     );
//     Logger.Info('Azure App Insights crash sent');
//   }
// }
