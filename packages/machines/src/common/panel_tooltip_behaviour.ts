// import { IPanelTooltipsSupport } from 'machines';
//
// export class PanelTooltipBehaviour implements IPanelTooltipBehaviour {
//   private _panels: { [key: string]: IPanelTooltipsSupport } = {};
//
//   public registerPanel(panel: IPanelTooltipsSupport): void {
//     if (!this._panels.hasOwnProperty(panel.featureName)) {
//       this._panels[panel.featureName] = panel;
//     }
//   }
//
//   public removePanelRegistration(panel: IPanelTooltipsSupport): void {
//     if (this._panels.hasOwnProperty(panel.featureName)) {
//       delete this._panels[panel.featureName];
//     }
//   }
//
//   public enableTooltips(featureNames: string[] | null = null): void {
//     if (featureNames !== null) {
//       for (let name of featureNames) {
//         let panel = this._panels.hasOwnProperty(name) ? this._panels[name] : null;
//         panel?.enableTooltips();
//       }
//     } else {
//       for (let name in this._panels) {
//         this._panels[name].enableTooltips();
//       }
//     }
//   }
//
//   public disableTooltips(featureNames: string[] | null = null): void {
//     if (featureNames !== null) {
//       for (let name of featureNames) {
//         let panel = this._panels.hasOwnProperty(name) ? this._panels[name] : null;
//         panel?.disableTooltips();
//       }
//     } else {
//       for (let name in this._panels) {
//         this._panels[name].disableTooltips();
//       }
//     }
//   }
// }
