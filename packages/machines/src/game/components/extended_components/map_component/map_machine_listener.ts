// import { IMapFeatureComponent } from 'machines';
// import { Container } from '@cgs/syd';
// import { GameStateMachineNotifierComponent } from '../../../../reels_engine_library';
// import { shared } from 'shared';
// import { common } from 'common';

// export class MapMachineListener extends StateMachineListener {
//   private _mapFeatureComponent: IMapFeatureComponent;

//   constructor(container: Container, mapFeatureComponent: IMapFeatureComponent) {
//     super(container);
//     this._mapFeatureComponent = mapFeatureComponent;
//     const notifierComponent = container.forceResolve<GameStateMachineNotifierComponent>(T_GameStateMachineNotifierComponent);
//     notifierComponent.notifier.AddListener(this);
//   }

//   onInitEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.initMap();
//   }

//   onAccelerateEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.closeMap();
//     this._mapFeatureComponent.blockButtons(true);
//   }

//   onBonusEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.closeMap();
//     this._mapFeatureComponent.blockButtons(true);
//   }

//   onEndBonusEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     if (!currentResponse.isFreeSpins) {
//       this._mapFeatureComponent.blockButtons(false);
//     }
//   }

//   onScatterEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.closeMap();
//     this._mapFeatureComponent.blockButtons(true);
//   }

//   onStopEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.blockButtons(currentResponse.isFreeSpins || currentResponse.isBonus);
//   }

//   onBeginFreeSpinsEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.blockButtons(true);
//   }

//   onFreeSpinRecoveryEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.blockButtons(true);
//   }

//   onEndFreeSpinsPopupEntered(currentResponse: ISpinResponse, previousResponse: ISpinResponse): void {
//     this._mapFeatureComponent.blockButtons(false);
//   }
// }
