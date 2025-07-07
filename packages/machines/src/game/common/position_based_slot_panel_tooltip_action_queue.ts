// import { Container } from "@cgs/syd";
// import { GameComponentProvider } from '../components/game_component_provider';

// export class PositionBasedSlotPanelTooltipActionQueue extends GameComponentProvider {
//   private _tooltipQueue: SlotPanelActionTooltip[] = [];
//   private _queueLock: Object = {};

//   private _currentTooltip: SlotPanelActionTooltip | null;

//   private _timer: GameTimer = new GameTimer(200 / 1000.0, 200 / 1000.0);

//   private _streamSubscription: StreamSubscription | null;

//   constructor(container: Container) {
//     super();
//     this._streamSubscription = this._timer.elapsed.subscribe((d) => this.onTimerElapsed());
//     this._timer.start();
//   }

//   private onTimerElapsed(): void {
//     if (!this._currentTooltip) {
//       const tooltip = this.tryGetTopPriorityTooltip();
//       if (tooltip) {
//         this._currentTooltip = tooltip;
//         tooltip.show();
//         GameTimer.wait(tooltip.msAcquire / 1000.0).then((t) =>
//           this._currentTooltip = null);
//         GameTimer.wait(tooltip.msDuration / 1000.0).then((t) => tooltip.hide());
//       }
//     }
//   }

//   public queueTooltip(tooltip: SlotPanelActionTooltip): void {
//     this._tooltipQueue.push(tooltip);
//   }

//   private tryGetTopPriorityTooltip(): SlotPanelActionTooltip | null {
//     const tooltip = this._tooltipQueue.find((_) => true);
//     if (tooltip) {
//       this._tooltipQueue.splice(this._tooltipQueue.indexOf(tooltip), 1);
//     }

//     return tooltip;
//   }

//   public deinitialize(): void {
//     this._tooltipQueue = [];
//     this._streamSubscription?.cancel();
//     super.deinitialize();
//   }
// }
