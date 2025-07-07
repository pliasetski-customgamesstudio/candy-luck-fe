// import { Container } from "@cgs/syd";
// import { SlotSession } from '../../../common/slot_session';
// import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';

// export class TotalWinControllerWithDynamicWinProvider implements ISlotSessionProvider {
//   private _totalWinController: TotalWinController;
//   private _totalWinView: ITotalWinView;
//   private _container: Container;
//   private _waysCount: number;

//   constructor(container: Container, waysCount: number = 0) {
//     this._container = container;
//     this._waysCount = waysCount;
//   }

//   get controller(): SlotSession {
//     if (!this._totalWinController) {
//       this._totalWinController = new TotalWinWithDynamicWinController(this._totalWinView, this._container, this._waysCount);
//     }

//     return this._totalWinController;
//   }

//   initialize(totalWinView: ITotalWinView): void {
//     this._totalWinView = totalWinView;
//   }
// }
