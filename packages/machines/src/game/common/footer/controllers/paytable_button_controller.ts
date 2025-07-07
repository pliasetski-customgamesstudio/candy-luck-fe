import { Container } from '@cgs/syd';
import { PaytableButtonView } from '../views/paytable_button_view';
import { T_IHudCoordinator, T_PaytablePopupComponent } from '../../../../type_definitions';
import { BaseSlotController } from '../../base_slot_controller';
import { PaytablePopupComponent } from '../../../components/popups/paytable_popup_component';
import { IHudCoordinator } from '../i_hud_coordinator';

export class PaytableButtonController extends BaseSlotController<PaytableButtonView> {
  private _paytablePopupComponent: PaytablePopupComponent;
  // private _paytablePopupHTMLComponent: PaytablePopupHTMLComponent;

  constructor(container: Container, buttonView: PaytableButtonView) {
    super(container, buttonView);
    const hudCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    hudCoordinator.available.listen((_e) => this._onHudAvailable());
    hudCoordinator.unavailable.listen((_e) => this._onHudUnavailable());
    hudCoordinator.hudEnable.listen((_e) => this._onHudAvailable());
    hudCoordinator.hudDisable.listen((_e) => this._onHudUnavailable());
  }

  get paytablePopupComponent(): PaytablePopupComponent {
    if (!this._paytablePopupComponent) {
      this._paytablePopupComponent =
        this.container.forceResolve<PaytablePopupComponent>(T_PaytablePopupComponent);
    }

    return this._paytablePopupComponent;
  }

  // get paytablePopupHTMLComponent(): PaytablePopupHTMLComponent {
  //   if (!this._paytablePopupHTMLComponent) {
  //     this._paytablePopupHTMLComponent = this.container.forceResolve<PaytablePopupHTMLComponent>(
  //       T_PaytablePopupHTMLComponent
  //     );
  //   }
  //
  //   return this._paytablePopupHTMLComponent;
  // }

  buttonClicked(): void {
    //if (EnvironmentConfig.useHTMLPayTable) {
    //  this.paytablePopupHTMLComponent.show();
    //} else {
    this.paytablePopupComponent.view.show();
    //}
  }

  enableButton(): void {
    this.view.enableButton();
  }

  private _onHudAvailable(): void {
    this.enableButton();
  }

  private _onHudUnavailable(): void {
    this.view.disableButton();
  }
}
