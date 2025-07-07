// import { Container } from "@cgs/syd";
// import { GameComponentProvider } from "./game_component_provider";
//
// export class AntiCheatProvider extends GameComponentProvider {
//   TIME_FOR_MONITORING: number = 1000 * 30;
//   _container: Container;
//   _slotFeaturesApiService: ISlotFeaturesApiService;
//
//   _startLocalTime: number;
//   _deltaTimeFromStartLocalTime: number = 0.0;
//
//   _pulserSub: StreamSubscription;
//
//   constructor(container: Container) {
//     super();
//     this._container = container;
//     this._slotFeaturesApiService = this._container.get(ISlotFeaturesApiService);
//   }
//
//   initialize(): void {
//     const framePulse = this._container.get(IFramePulse);
//     this._pulserSub = framePulse.framePulsate.subscribe(this._update);
//   }
//
//   private _update = async (dt: number): Promise<void> => {
//     //we check dt > 3 for users who switch tabs
//     /*if(typeof this._startLocalTime !== 'number' || dt > 3){
//       this._startLocalTime = new Date().getTime();
//       this._deltaTimeFromStartLocalTime = 0.0;
//     } else {
//       this._deltaTimeFromStartLocalTime += dt;
//       if(new Date().getTime() - this._startLocalTime > this.TIME_FOR_MONITORING){
//         if(this._deltaTimeFromStartLocalTime * 1000 > this.TIME_FOR_MONITORING * 1.20){
//           this._pulserSub?.cancel();
//           await this._slotFeaturesApiService.syncData(this._deltaTimeFromStartLocalTime, "1");
// //          await this._container.get(ISomethingWentWrongShower).showSomethingWentWrong();
// //          this._container.get(IGameNavigator).completeGame(new BackToLobbyGameResult());
//         }
//
//         this._startLocalTime = new Date().getTime();
//         this._deltaTimeFromStartLocalTime = 0.0;
//       }
//     }*/
//   }
//
//   deinitialize(): void {
//     this._pulserSub?.cancel();
//   }
// }
