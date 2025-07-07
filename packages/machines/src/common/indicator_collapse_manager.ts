// import { IIndicatorCollapseManager } from 'common';
// import { IClientProperties } from 'machines';
// import { StringUtils, Logger } from 'shared';
//
// export class IndicatorCollapseManager implements IIndicatorCollapseManager {
//   private _clientProperties: IClientProperties;
//
//   constructor(clientProperties: IClientProperties) {
//     this._clientProperties = clientProperties;
//   }
//
//   tryToCollapseIndicator(indicatorCollapseBehavior: IIndicatorCollapseBehavior): void {
//     if (!indicatorCollapseBehavior.slotGame ||
//         StringUtils.isNullOrEmpty(indicatorCollapseBehavior.slotGame.gameParams?.gameId)) {
//       Logger.Warn("SlotGame or GameId can not be null");
//       return;
//     }
//
//     const notCollapseIndicatorClientProperty = `features.${indicatorCollapseBehavior.clientPropertyFeatureName}.notCollapseIndicator`;
//     const notCollapseIndicator = this._clientProperties.get(notCollapseIndicatorClientProperty, false);
//     if (notCollapseIndicator) return;
//
//     indicatorCollapseBehavior.collapseIndicator();
//     Logger.Info(`Indicator of ${indicatorCollapseBehavior.clientPropertyFeatureName} is collapsed`);
//   }
// }
