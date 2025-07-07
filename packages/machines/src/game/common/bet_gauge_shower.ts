// import { Future } from 'dart:async';

// export class BetGaugeTooltip {
//   show: Function;
//   type: string;
//   priority: number;
//   msDuration: number;
//   hide: Function;
//   stopTime: Date;

//   constructor(show: Function, hide: Function, type: string, msDuration: number, priority: number) {
//     this.show = show;
//     this.hide = hide;
//     this.type = type;
//     this.msDuration = msDuration;
//     this.priority = priority;
//   }
// }

// export class BetGaugeShower extends GameComponentProvider {
//   _container: Container;
//   _tooltipQueue: BetGaugeTooltip[];
//   _isShowing: boolean;
//   currentTooltip: BetGaugeTooltip;

//   constructor(_container: Container) {
//     super();
//     this._container = _container;
//     this._tooltipQueue = [];
//     this._isShowing = false;
//   }

//   showTooltip(tooltip: BetGaugeTooltip): void {
//     if (this.currentTooltip) {
//       if (tooltip.priority >= this.currentTooltip.priority) {
//         this.currentTooltip.stopTime = new Date();
//       } else {
//         return;
//       }
//     }

//     const highestPriorityTooltip = this._getTooltipWithHighestPriority();
//     if (highestPriorityTooltip) {
//       if (tooltip.priority < highestPriorityTooltip.priority) {
//         return;
//       }
//     }

//     this._tooltipQueue.push(tooltip);

//     this._tryShowTooltip();
//   }

//   async _tryShowTooltip(): Promise<void> {
//     if (this._isShowing) {
//       return;
//     }
//     this._isShowing = true;
//     try {
//       let tooltip: BetGaugeTooltip = null;

//       tooltip = this._getTooltipWithHighestPriority();
//       this.currentTooltip = tooltip;
//       this._tooltipQueue = [];

//       while (tooltip) {
//         await this._showTooltipInternal(tooltip);

//         const newTooltip = this._getTooltipWithHighestPriority();
//         this._tooltipQueue = [];

//         if (!newTooltip || newTooltip.type != tooltip.type) {
//           tooltip.hide();
//         }
//         tooltip = newTooltip;
//         this.currentTooltip = tooltip;

//         await new Future.delayed(new Duration({ milliseconds: 50 }));
//       }
//     } finally {
//       this._isShowing = false;
//     }
//   }

//   _getTooltipWithHighestPriority(): BetGaugeTooltip {
//     let result = this._tooltipQueue.find((v) => v);
//     for (const tooltip of this._tooltipQueue) {
//       if (tooltip.priority >= result.priority) {
//         result = tooltip;
//       }
//     }

//     return result;
//   }

//   async _showTooltipInternal(tooltip: BetGaugeTooltip): Promise<void> {
//     this.currentTooltip = tooltip;
//     try {
//       tooltip.stopTime = new Date().addMilliseconds(tooltip.msDuration);
//       tooltip.show();
//       while (new Date().isBefore(tooltip.stopTime)) {
//         await new Future.delayed(new Duration({ milliseconds: 50 }));
//       }
//     } finally {
//       this.currentTooltip = null;
//     }
//   }

//   deinitialize(): void {
//     this._tooltipQueue = [];
//     super.deinitialize();
//   }
// }
