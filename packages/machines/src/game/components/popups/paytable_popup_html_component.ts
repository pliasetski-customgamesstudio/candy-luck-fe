import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import {
  T_ISlotSessionProvider,
  T_ResourcesComponent,
  T_TutorialComponent,
} from '../../../type_definitions';
import { Container, SoundSceneObject } from '@cgs/syd';
import { IAppSettings, MachineSymbol } from '@cgs/common';
import { Fullscreen, Translations } from '@cgs/shared';
import { SlotSession } from '../../common/slot_session';
import { SoundInstance } from '../../../reels_engine/sound_instance';
import { ResourcesComponent } from '../resources_component';
import { TutorialComponent } from '../../common/footer/components/TutorialComponent';

interface IPayout {
  label: string;
  value: string | number;
}

interface IPaytableItem {
  image?: string | null;
  title?: string;
  descriptions?: string[];
  payouts?: IPayout[];
  leftPayouts?: IPayout[];
  showLines?: boolean;
}

interface IPaytableSection {
  items: IPaytableItem[];
}

interface IPaytableTab {
  id: string;
  title: string;
  selected?: boolean;
  sections: IPaytableSection[];
}

export class PaytablePopupHTMLComponent {
  private resourcePath: string = 'slot/paytable/html';
  private template: string | null = null;
  private translations: Translations;
  private unsubscribe: (() => void)[] = [];
  private _buttonClickSound: SoundInstance | null = null;

  constructor(
    private resourceUrl: string,
    private container: Container,
    private appSettings: IAppSettings
  ) {
    if (!this.resourceUrl) {
      throw new Error('PaytablePopupHTMLComponent requires resourceUrl!');
    }

    this.translations = new Translations(
      this.resourceUrl,
      `${this.resourcePath}/paytableConfig.json`
    );
    this.preloadData();
  }

  public show(): void {
    if (!this.template || !this.translations.isLoaded) {
      return;
    }

    // TODO: remove after fixing all game-rules.json
    if (!this.translations.get('symbolsSections')) {
      this.showOld();
      return;
    }

    const slotSession =
      this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const symbols = slotSession.machineInfo.symbols;

    const tabs: IPaytableTab[] = [
      this.getSymbolInfoTab(slotSession, symbols),
      this.getGameRuleTab(),
    ];

    const dialogContainer = this.dialogContainer;
    if (dialogContainer) {
      const template = Handlebars.compile(this.template);
      dialogContainer.insertAdjacentHTML(
        'beforeend',
        template({ tabs, content: this.translations.get('content') })
      );

      const linesBlock = document.querySelector('.paylines-block');
      linesBlock && this.renderLines(linesBlock, this.translations.get('paylines'));

      this.handlePaytableClose();
      this.handleFullscreenMode();
      this.toggleFullscreenButton();
      this.handleVolume();
      this.toggleVolumeButton();
      this.handleTutorial();
    }
  }

  private getSymbolInfoTab(slotSession: SlotSession, symbols: MachineSymbol[]): IPaytableTab {
    const result: IPaytableTab = {
      id: 'payTable',
      title: 'PAYTABLE',
      selected: true,
      sections: [],
    };

    const symbolsSections = this.translations.get('symbolsSections');

    symbolsSections.forEach((section: any) => {
      switch (section.type) {
        case 'symbol-with-rules':
          result.sections.push(
            this.getPaytableSingleSectionWithRules(slotSession, section, symbols)
          );
          break;
        case 'multiple-symbols':
          result.sections.push(this.getMultipleSymbolsSection(slotSession, section, symbols));
          break;
      }
    });

    return result;
  }

  private getGameRuleTab(): IPaytableTab {
    return {
      id: 'gameRules',
      title: 'GAME RULES',
      sections: this.translations.get('gameRules').map((section: Record<string, any>) => ({
        items: [
          {
            title: section.feature,
            descriptions: section.rules,
            showLines: section.id === 'lines',
          },
        ],
      })),
    };
  }

  private getPaytableSingleSectionWithRules(
    slotSession: SlotSession,
    section: any,
    symbols: MachineSymbol[]
  ): IPaytableSection {
    const leftPayouts =
      section.symbolId === 15
        ? this.getSpecialSymbolsPayouts(slotSession, 'CUPCAKE', undefined, symbols)
        : this.getSingleSectionWithRulesPayouts(slotSession, section, symbols);

    return {
      items: [
        {
          image: this.getFilePath(section.symbolIcon),
          title: section.title,
          descriptions: section.rules,
          leftPayouts,
        },
      ],
    };
  }

  private getSingleSectionWithRulesPayouts(
    slotSession: SlotSession,
    section: any,
    symbols: MachineSymbol[]
  ): IPayout[] | undefined {
    const payouts: Record<string, string | number> | undefined = section.payouts;
    if (payouts) {
      return Object.entries(payouts).map(([label, value]) => ({
        label,
        value: isNaN(Number(value))
          ? String(value)
          : Math.round(Number(value) * slotSession.currentBet.bet).toLocaleString('en-US'),
      }));
    }

    return this.getPayouts(
      slotSession,
      symbols.find((symbol) => symbol.id === section.symbolId)
    );
  }

  private getMultipleSymbolsSection(
    slotSession: SlotSession,
    section: any,
    symbols: MachineSymbol[]
  ): IPaytableSection {
    const result: IPaytableSection = {
      items: [],
    };
    section.symbols.forEach((sectionSymbol: any) => {
      result.items.push({
        //title: section.title,
        image: this.getFilePath(sectionSymbol.icon),
        payouts: this.getPayouts(
          slotSession,
          symbols.find((symbol) => symbol.id === sectionSymbol.id)
        ),
      });
    });

    return result;
  }

  private getPayouts(
    slotSession: SlotSession,
    symbol: MachineSymbol | undefined
  ): IPayout[] | undefined {
    return symbol?.gains
      ?.map((value, index) => ({
        label: `x${index + 1}`,
        value: isNaN(Number(value))
          ? String(value)
          : Math.round(value * slotSession.currentBet.bet * slotSession.lines).toLocaleString('en-US'),
      }))
      .filter((item) => parseFloat(item.value) > 0)
      .reverse();
  }

  private renderLines(containerElement: Element, paylinesTable: number[][]): void {
    for (let i = 0; i < paylinesTable.length; i++) {
      const slot = document.createElement('div');
      slot.classList.add('slot-container');
      const payLine = paylinesTable[i];

      for (let j = 0; j < 15; j++) {
        const cell = document.createElement('div');
        cell.className = 'slot-cell';

        if (payLine.includes(j)) {
          cell.classList.add('slot-payline');
        }

        slot.appendChild(cell);
      }

      containerElement.appendChild(slot);
    }
  }

  // TODO: remove after fixing all game-rules.json
  /**
   * @deprecated use show() instead
   */
  public showOld(): void {
    if (!this.template || !this.translations.isLoaded) {
      return;
    }

    const slotSession =
      this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const symbols = slotSession.machineInfo.symbols;

    const specialSymbolIconMap: Record<string, string> = {
      SCATTER: this.getFilePath('scatter.png'),
      MINE_CART: this.getFilePath('mine-cart.png'),
      WILD_AND_MINE_CART_WILD: this.getFilePath('wild.png'),
    };

    const simpleSymbolIconMap: Record<string, string> = {
      3: this.getFilePath('simple-3.png'),
      4: this.getFilePath('simple-4.png'),
      5: this.getFilePath('simple-5.png'),
      6: this.getFilePath('simple-6.png'),
      7: this.getFilePath('simple-7.png'),
      8: this.getFilePath('simple-8.png'),
      9: this.getFilePath('simple-9.png'),
      10: this.getFilePath('simple-10.png'),
      11: this.getFilePath('simple-11.png'),
      12: this.getFilePath('simple-12.png'),
      13: this.getFilePath('simple-13.png'),
      16: this.getFilePath('simple-16.png'),
      17: this.getFilePath('simple-17.png'),
    };

    const tabs: IPaytableTab[] = [
      {
        id: 'payTable',
        title: 'PAYTABLE',
        selected: true,
        sections: [
          ...this.translations
            .get('tabs')
            .find((item: any) => item.id === 'special-symbols')
            .sections.map((section: Record<string, any>) => ({
              items: [
                {
                  image: specialSymbolIconMap[section.symbol] || null,
                  title: section.title,
                  descriptions: section.rules,
                  leftPayouts: this.getSpecialSymbolsPayouts(
                    slotSession,
                    section.symbol,
                    section.payouts,
                    symbols
                  ),
                },
              ],
            })),
          this.buildSimpleSection([3], slotSession, symbols, simpleSymbolIconMap),
          this.buildSimpleSection([4, 5, 6, 16], slotSession, symbols, simpleSymbolIconMap),
          this.buildSimpleSection([7, 8, 9, 10], slotSession, symbols, simpleSymbolIconMap),
          this.buildSimpleSection([11, 12, 13, 17], slotSession, symbols, simpleSymbolIconMap),
        ],
      },
      {
        id: 'gameRules',
        title: 'GAME RULES',
        sections: this.translations
          .get('tabs')
          .find((item: any) => item.id === 'game-rules')
          .sections.map((section: Record<string, any>) => ({
            items: [
              {
                title: section.feature,
                descriptions: section.rules,
                showLines: section.id === 'lines',
              },
            ],
          })),
      },
    ];

    const dialogContainer = this.dialogContainer;

    if (dialogContainer) {
      const template = Handlebars.compile(this.template);
      dialogContainer.insertAdjacentHTML(
        'beforeend',
        template({ tabs, content: this.translations.get('content') })
      );

      const linesBlock = document.querySelector('.paylines-block');
      linesBlock && this.renderLinesOld(linesBlock);

      this.handlePaytableClose();
      this.handleFullscreenMode();
      this.toggleFullscreenButton();
      this.handleVolume();
      this.toggleVolumeButton();
    }
  }

  // TODO: remove after fixing all game-rules.json
  private getSpecialSymbolsPayouts(
    slotSession: SlotSession,
    symbolId: string,
    sectionPayouts: Record<string, string | number> | undefined,
    symbols: MachineSymbol[]
  ): IPayout[] | undefined {
    if (sectionPayouts) {
      return Object.entries(sectionPayouts).map(([label, value]) => ({
        label,
        value: isNaN(Number(value))
          ? String(value)
          : Math.round(Number(value) * slotSession.currentBet.bet).toLocaleString('en-US'),
      }));
    }

    if (['MINE_CART', 'CUPCAKE'].includes(symbolId)) {
      return [0, 0, 1, 3, 10, 25, 50, 100, 500]
        .map((value, index) => ({
          label: `x${index + 1}`,
          value: isNaN(Number(value))
            ? String(value)
            : Math.round(value * slotSession.currentBet.bet * slotSession.lines).toLocaleString('en-US'),
        }))
        .filter((item) => parseFloat(item.value) > 0)
        .reverse();
    }

    return symbols
      .find((symbol) => symbol.type === 'wild' && symbol.id === 15)
      ?.gains?.map((value, index) => ({
        label: `x${index + 1}`,
        value: isNaN(Number(value))
          ? String(value)
          : Math.round(value * slotSession.currentBet.bet).toLocaleString('en-US'),
      }))
      .filter((item) => parseFloat(item.value) > 0)
      .reverse();
  }

  private buildSimpleSection(
    symbolIds: number[],
    slotSession: SlotSession,
    symbols: MachineSymbol[],
    iconMap: Record<string, string>
  ): IPaytableSection {
    return {
      items: symbols
        .filter((symbol) => !!iconMap[symbol.id.toString()] && symbolIds.includes(symbol.id))
        .map((symbol) => ({
          image: iconMap[symbol.id.toString()],
          payouts: [...(symbol.gains || [])]
            .map((value, index) => ({
              label: `x${index + 1}`,
              value: isNaN(Number(value))
                ? String(value)
                : Math.round(value * slotSession.currentBet.bet).toLocaleString('en-US'),
            }))
            .filter((item) => parseFloat(item.value) > 0)
            .reverse(),
        })),
    };
  }

  /**
   * @deprecated use renderLines() instead
   */
  // TODO: remove after fixing all game-rules.json
  private renderLinesOld(containerElement: Element): void {
    const paylinesTable = [
      [5, 6, 7, 8, 9],
      [0, 1, 2, 3, 4],
      [10, 11, 12, 13, 14],
      [0, 6, 12, 8, 4],
      [10, 6, 2, 8, 14],
      [5, 1, 2, 3, 9],
      [5, 11, 12, 13, 9],
      [0, 1, 7, 13, 14],
      [10, 11, 7, 3, 4],
      [5, 1, 7, 13, 9],
      [5, 11, 7, 3, 9],
      [0, 6, 7, 8, 4],
      [10, 6, 7, 8, 14],
      [0, 6, 2, 8, 4],
      [10, 6, 12, 8, 14],
      [5, 6, 2, 8, 9],
      [5, 6, 12, 8, 9],
      [0, 1, 12, 3, 4],
      [10, 11, 2, 13, 14],
      [0, 11, 12, 13, 4],
      [10, 1, 2, 3, 14],
      [5, 1, 12, 3, 9],
      [5, 11, 2, 13, 9],
      [0, 11, 2, 13, 4],
      [10, 1, 12, 3, 14],
      [0, 11, 7, 3, 14],
      [10, 1, 7, 13, 4],
      [5, 1, 12, 8, 14],
      [0, 11, 7, 13, 4],
      [10, 6, 2, 3, 9],
    ];

    this.renderLines(containerElement, paylinesTable);
  }

  private async preloadData(): Promise<void> {
    try {
      this.template = await fetch(this.getFilePath('template.hbs')).then((response) =>
        response.ok ? response.text() : null
      );
    } catch {
      //
    }
  }

  private getFilePath(path: string): string {
    return `${this.resourceUrl}/${this.resourcePath}/${path}`;
  }

  private handlePaytableClose(): void {
    const onClose = () => {
      this.handleButtonClickSound();
      this.closePaytable();
    };

    const closeElement = document.getElementById('close-paytable');
    closeElement?.addEventListener('click', onClose);
    this.unsubscribe.push(() => closeElement?.removeEventListener('click', onClose));
  }

  private closePaytable(): void {
    const paytableElement = this.paytableElement;
    paytableElement && this.dialogContainer?.removeChild(this.paytableElement);
    this.unsubscribe.forEach((callback) => callback());
    this.unsubscribe = [];
  }

  private handleFullscreenMode(): void {
    const toggleFullscreen = async () => {
      this.handleButtonClickSound();
      await Fullscreen.toggleFullscreen();
      this.toggleFullscreenButton();
    };

    ['enter-fullscreen', 'exit-fullscreen'].forEach((id) => {
      const element = document.getElementById(id);
      element?.addEventListener('click', toggleFullscreen);
      this.unsubscribe.push(() => element?.removeEventListener('click', toggleFullscreen));
    });
  }

  private toggleFullscreenButton(): void {
    const isFullscreen = Fullscreen.isFullscreen;

    const enterElement = document.getElementById('enter-fullscreen');
    const exitElement = document.getElementById('exit-fullscreen');

    if (isFullscreen) {
      enterElement?.classList.add('is-hidden');
      exitElement?.classList.remove('is-hidden');
    } else {
      enterElement?.classList.remove('is-hidden');
      exitElement?.classList.add('is-hidden');
    }
  }

  private handleVolume(): void {
    const toggleVolume = async () => {
      if (this.appSettings.sounds === 0) {
        this.appSettings.sounds = 1;
      } else {
        this.appSettings.sounds = 0;
      }

      this.toggleVolumeButton();
    };

    ['volume-mute', 'volume-unmute'].forEach((id) => {
      const element = document.getElementById(id);
      element?.addEventListener('click', toggleVolume);
      this.unsubscribe.push(() => element?.removeEventListener('click', toggleVolume));
    });
  }

  private handleTutorial(): void {
    const onTutorial = () => {
      this.handleButtonClickSound();
      this.closePaytable();
      const tutorial = this.container.forceResolve<TutorialComponent>(T_TutorialComponent);
      tutorial.startTutorial();
    };

    const closeElement = document.getElementById('tutorial');
    closeElement?.addEventListener('click', onTutorial);
    this.unsubscribe.push(() => closeElement?.removeEventListener('click', onTutorial));
  }

  private toggleVolumeButton(): void {
    const muteElement = document.getElementById('volume-mute');
    const unmuteElement = document.getElementById('volume-unmute');

    if (this.appSettings.sounds === 0) {
      muteElement?.classList.add('is-hidden');
      unmuteElement?.classList.remove('is-hidden');
    } else {
      muteElement?.classList.remove('is-hidden');
      unmuteElement?.classList.add('is-hidden');
    }
  }

  private get dialogContainer(): Element | null {
    return document.getElementById('dialogs');
  }

  private get paytableElement(): Element | null {
    return document.getElementById('paytable');
  }

  private handleButtonClickSound(): void {
    this.buttonClickSound?.stop();
    this.buttonClickSound?.play();
  }

  private get buttonClickSound(): SoundInstance {
    if (!this._buttonClickSound) {
      const resourcesComponent = this.container.resolve<ResourcesComponent>(T_ResourcesComponent);
      const buttonClickSoundScene = resourcesComponent?.sounds
        .findById<SoundSceneObject>('button_click')
        ?.findAllByType(SoundSceneObject)[0];
      this._buttonClickSound = new SoundInstance(buttonClickSoundScene || null);
    }

    return this._buttonClickSound;
  }
}
