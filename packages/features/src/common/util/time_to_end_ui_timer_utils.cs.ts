// import { SceneObject } from 'syd';
//
// enum UiTimerFormat {
//   LongTimeEventFormat
// }
//
// class TimeToEndUiTimerExtensions {
//   static setupTimer(timerController: SceneObject, timeToEnd: Duration, format: UiTimerFormat, timerTextId: string = "timer"): void {
//     const timerText = timerController.findById(timerTextId);
//
//     if (!timerText) {
//       return;
//     }
//
//     if (format == UiTimerFormat.LongTimeEventFormat) {
//       const weeks = Math.floor(timeToEnd.inDays() / 7);
//       const days = timeToEnd.inDays() - weeks * 7;
//       const hours = timeToEnd.inHours() - weeks * 7 * 24 - days * 24;
//       const minutes = timeToEnd.inMinutes() - weeks * 7 * 24 * 60 - days * 24 * 60 - hours * 60;
//       const seconds = timeToEnd.inSeconds() - weeks * 7 * 24 * 60 * 60 -
//           days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;
//
//       if (weeks > 0) {
//         timerText.text = weeks.toString();
//         timerController.stateMachine.switchToState(weeks > 1 ? "weeks" : "week");
//       } else if (days > 0) {
//         timerText.text = days.toString();
//         timerController.stateMachine.switchToState(days > 1 ? "days" : "day");
//       } else if (hours > 0) {
//         timerText.text = `${hours.toString().padStart(2, "0")}H:${minutes.toString().padStart(2, "0")}M`;
//         timerController.stateMachine.switchToState("simple");
//       } else {
//         timerText.text = `${minutes.toString().padStart(2, "0")}M:${seconds.toString().padStart(2, "0")}S`;
//         timerController.stateMachine.switchToState("simple");
//       }
//     }
//   }
// }
