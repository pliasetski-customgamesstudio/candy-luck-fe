import { Button, Container, EventDispatcher, EventStream } from '@cgs/syd';
import { ResourcesComponent } from '../../resources_component';
import { T_ResourcesComponent } from '../../../../type_definitions';

export enum BuyCreditsOption {
  Gem,
  Ads,
  GemsAndAds,
}

const DEFAULT_SELECT_OPTION = BuyCreditsOption.GemsAndAds;

export const T_CandyLuckCoinBuySelect = Symbol('CandyLuckCoinBuySelect');

export class CandyLuckCoinBuySelect {
  private _selectedShopOption: BuyCreditsOption = DEFAULT_SELECT_OPTION;

  private readonly _selectedShopOptionChange: EventDispatcher<BuyCreditsOption> =
    new EventDispatcher();

  private readonly _showTestSelect: boolean = false;

  constructor(container: Container) {
    const root = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;

    if (this._showTestSelect) {
      root
        .findAllById<Button>('ShopBtn')
        .forEach((button) =>
          button.longPressed.listen(() =>
            this.isSelectRendered()
              ? this.removeBuyCreditsOptionsSwitcher()
              : this.createBuyCreditsOptionsSwitcher()
          )
        );
    }
  }

  public get selectedShopOptionChanged(): EventStream<BuyCreditsOption> {
    return this._selectedShopOptionChange.eventStream;
  }

  public get selectedShopOption(): BuyCreditsOption {
    return this._selectedShopOption;
  }

  private isSelectRendered(): boolean {
    return !!document.getElementById('buy-credits-option-select');
  }

  private createBuyCreditsOptionsSwitcher(): void {
    this.removeBuyCreditsOptionsSwitcher();

    const select = document.createElement('select');
    select.id = 'buy-credits-option-select';
    select.style.position = 'fixed';
    select.style.top = '12px';
    select.style.right = '12px';
    select.style.zIndex = '10000';
    select.style.padding = '4px 8px';
    select.style.background = '#ff9800';
    select.style.color = '#fff';
    select.style.border = 'none';
    select.style.borderRadius = '4px';
    select.style.fontSize = '14px';
    select.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

    Object.keys(BuyCreditsOption).forEach((option) => {
      if (!isNaN(Number(option))) {
        return;
      }

      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      if (BuyCreditsOption[option as keyof typeof BuyCreditsOption] === this._selectedShopOption) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    select.onchange = () => {
      const value = select.value as keyof typeof BuyCreditsOption;
      this._selectedShopOption = BuyCreditsOption[value];
      this._selectedShopOptionChange.dispatchEvent(this._selectedShopOption);
    };

    document.body.appendChild(select);
  }

  private removeBuyCreditsOptionsSwitcher(): void {
    const select = document.getElementById('buy-credits-option-select');
    select?.remove();
  }
}
