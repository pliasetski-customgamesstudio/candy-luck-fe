// import { Duration } from '@cgs/shared';
//
// export class StartupTimeMetter {
//   private _startTrackingTimes: Record<string, Date> = {};
//   private _measuredTimes: Record<string, Duration> = {};
//   get measuredTimes(): Record<string, Duration> {
//     return this._measuredTimes;
//   }
//
//   startTracking(key: string): void {
//     this._startTrackingTimes[key] = new Date();
//   }
//
//   stopTracking(key: string): void {
//     if (this._startTrackingTimes[key]) {
//       const measuredTime = new Date();.substract.difference(this._startTrackingTimes[key]);
//       if (key in this._measuredTimes) {
//         this._measuredTimes[key] = this._measuredTimes[key].add(measuredTime);
//       } else {
//         this._measuredTimes[key] = measuredTime;
//       }
//       delete this._startTrackingTimes[key];
//     }
//   }
// }
