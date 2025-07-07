// import { IClientProperties, T_IClientProperties, T_GameOperation } from "@cgs/common";
// import { Container } from "@cgs/syd";
// import { BaseSlotController } from '../../base_slot_controller';
// import { SlotSession, SlotSessionProperties } from '../../slot_session';
// import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
// import { GameOperation } from '../../../../game_operation';
// import { T_ISlotSessionProvider } from '../../../../type_definitions';

// export abstract class IBetGaugeProvider {
//   abstract getGaugeTooltip(): BetGaugeTooltip;
// }

// export class LevelUpSpeedController extends BaseSlotController<LevelUpSpeedView> {
//   private _slotSession: SlotSession;
//   private _clientProperties: IClientProperties;
//   private _betGaugeShower: BetGaugeShower;
//   private _betGaugeProviders: IBetGaugeProvider[];
//   private _operation: GameOperation;
//   private _tmpOpenedCount: number;

//   constructor(container: Container, view: LevelUpSpeedView) {
//     super(container, view);
//     this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
//     this._slotSession = container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
//     this._betGaugeShower = container.resolve(BetGaugeShower);
//     this._slotSession.propertyChanged.listen(event => this._onBetIndexChanged(event));

//     this._operation = container.forceResolve<GameOperation>(T_GameOperation) as GameOperation;
//   }

//   private _onBetIndexChanged(property: SlotSessionProperties): void {
//     switch (property) {
//       case SlotSessionProperties.UserMaxBet:
//       case SlotSessionProperties.UserChangedBet:
//         this._betGaugeProviders = this._betGaugeProviders ?? this._operation.controller.getChildren().filter((c) => c instanceof IBetGaugeProvider).map((c) => c as IBetGaugeProvider).toList();

//         const tooltips = this._betGaugeProviders
//           .map((provider) => provider.getGaugeTooltip())
//           .filter((tooltip) => !!tooltip).toList();
//         tooltips.sort((i1, i2) => i2.priority - i1.priority);
//         const gaugeTooltip = tooltips.length > 0 ? tooltips[0] : null;

//         if (gaugeTooltip) {
//           this._betGaugeShower.showTooltip(gaugeTooltip);
//           return;
//         }

//         break;
//     }
//   }

//   private async _closeAfterDelayFunc(): Promise<void> {
//     this._tmpOpenedCount++;
//     await new Promise(resolve => setTimeout(resolve, 5 * 1000));
//     this._tmpOpenedCount--;
//     if (this._tmpOpenedCount === 0) {
//       this.view.hideProgress();
//     }
//   }
// }
