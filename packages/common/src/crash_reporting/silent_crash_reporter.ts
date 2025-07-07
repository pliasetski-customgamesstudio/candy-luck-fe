// import { ISilentCrashReporter } from './i_silent_crash_reporter';
// import { AzureAppSettings, AzureInsights } from './azure_insights_wrapper';
// import { IApplicationInfo } from '../i_application_info';
// import { UserInfoHolder } from '../services/user_info_holder';
// import { Logger } from '@cgs/shared';

// export class SilentCrashReporter implements ISilentCrashReporter {
//   private _azureInsights: AzureInsights;

//   constructor(appInfo: IApplicationInfo) {
//     this._azureInsights = new AzureInsights(
//       new AzureAppSettings({
//         appId: 'baaa31a5-f108-4932-b9e2-e4b8e44c65f0',
//         version: appInfo.versionCode,
//       })
//     );
//   }

//   reportCrash(message: string, stackTrace: any): void {
//     const stackTraceText = stackTrace ? stackTrace.toString() : 'No StackTrace';
//     this._azureInsights.sendAzureError(
//       message,
//       stackTraceText,
//       Logger.GetHistory(),
//       false,
//       UserInfoHolder.userId
//     );
//     Logger.Info('Azure insights silent crash sent');
//   }
// }
