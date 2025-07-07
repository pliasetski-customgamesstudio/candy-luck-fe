// import { Func0, Logger } from '@cgs/shared';
//
// export class TaskWrappers {
//   static ignoreException(taskFactory: Func0<Promise<any>>, exceptionType: any): Promise<any> {
//     return taskFactory()!.catch(
//       (e: any, st: any) => {
//         Logger.Warn(`Ignoring exception\n${e}${st}`);
//       },
//       (e: any) => e instanceof exceptionType
//     );
//   }
// }
