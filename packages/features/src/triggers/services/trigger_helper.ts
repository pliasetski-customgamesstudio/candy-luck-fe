// import {Logger} from "../../../../../shared/lib/src/utils/logger";
//
// class TriggerHelper {
//   static checkCondition(value: number, list: string, min: number, each: number): boolean {
//     Logger.Info(`Checking condition for trigger value = ${value}. List ${list}; Min ${min}; Each ${each}`);
//
//     if (list.trim() !== '') {
//       try {
//         const levels: number[] = list.split(',').map((s) => parseInt(s));
//         if (levels.includes(value)) {
//           Logger.Info("Value in list");
//           return true;
//         }
//       }
//       catch (e) {
//         // ignore Exception
//         Logger.Error(`Exception parsing ${e}`);
//       }
//     }
//
//     if (each > 0 && value >= min && (value - min) % each === 0) {
//       Logger.Info("Value = Min + X*Each");
//       return true;
//     }
//
//     Logger.Info("Condition check failed");
//     return false;
//   }
// }
