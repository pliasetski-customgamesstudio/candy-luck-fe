import { Container } from '@cgs/syd';
import { T_ISpinController, T_LobbyFacade } from '../../../type_definitions';
import { LobbyFacade } from '../../../lobby_facade';
import { SpinController } from '../footer/controllers/spin_controller';
import { Key } from 'ts-keycode-enum';
import { CustomGamesResourceCache, SceneCommon, T_SceneCommon } from '@cgs/common';

interface IPredefinedReel {
  id: string;
  value: number[][][];
}

export enum CheatType {
  Cfg = 'Custom Config',
  Command = 'Command',
  Reels = 'Reels set',
}

interface ActiveCheat<T = any> {
  type: CheatType;
  once?: boolean;
  value: T;
}

function formatCommandText(command: string): string {
  return command
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

const STORAGE_KEY = {
  POSITION: 'CHEAT_CONSOLE_POSITION',
  FAST_SPIN: 'CHEAT_CONSOLE_FAST_SPIN',
};

export class CheatConsole {
  private _container: Container;

  private _consoleEl: HTMLDivElement | null = null;
  private _isShown: boolean = false;
  private _isCollapsed: boolean = false;

  private _cheatConfigs: string[];
  private _cheatCommands: string[];
  private _cheatReels: boolean;
  private _customCheatInput: boolean;

  private _fastSpinMode: boolean = this.getSavedFastSpinMode();

  private _activeCheat: ActiveCheat | null = null;
  private _resourceCache: CustomGamesResourceCache;
  private _selectedIcon: string | null = null;
  private _dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private _contentEl: HTMLDivElement | null = null;

  constructor(
    cheatConfigs: string[],
    cheatCommands: string[],
    cheatReels: boolean,
    customCheatInput: boolean,
    container: Container
  ) {
    this._cheatConfigs = cheatConfigs;
    this._cheatCommands = cheatCommands;
    this._cheatReels = cheatReels;
    this._customCheatInput = customCheatInput;
    this._container = container;
    this._resourceCache = container
      .forceResolve<LobbyFacade>(T_LobbyFacade)
      .resolve<SceneCommon>(T_SceneCommon)!.resourceCache as CustomGamesResourceCache;
  }

  public getActiveCheat(): ActiveCheat | null {
    const activeCheat = this._activeCheat;

    if (activeCheat?.once) {
      this.setActiveCheat(null);
    }

    return activeCheat;
  }

  public getFastSpinMode(): boolean {
    return this._fastSpinMode;
  }

  public initialize(predefinedReels: IPredefinedReel[]): void {
    const frame = document.getElementById('iframe_canvas');
    frame?.focus();

    this._consoleEl = document.createElement('div');

    Object.assign(this._consoleEl.style, {
      width: '100%',
      maxWidth: '400px',
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: 'rgba(28, 28, 28, 0.95)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'none',
      zIndex: '9999',
      fontFamily: 'Arial, sans-serif',
    });

    // Add header for drag functionality
    const headerStyle = `
      padding: 8px 16px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px 8px 0 0;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const buttonContainerStyle = `
      display: flex;
      gap: 8px;
    `;

    const headerButtonStyle = `
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;

    // Create content container for scrolling
    this._contentEl = document.createElement('div');
    Object.assign(this._contentEl.style, {
      maxHeight: '80vh',
      overflowY: 'auto',
      padding: '16px',
    });
    this.restoreConsolePosition();

    const buttonStyle = `
      background-color: #4a4a4a;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      margin: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;
    `;

    const selectStyle = `
      background-color: #3a3a3a;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 4px 8px;
      margin: 4px;
      cursor: pointer;
      font-size: 12px;
      min-width: 150px;
    `;

    const inputStyle = `
      background-color: #3a3a3a;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 6px 12px;
      margin: 4px;
      font-size: 12px;
      width: calc(100% - 32px);
    `;

    const sectionStyle = `
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
    `;

    this._consoleEl.innerHTML = `
      <div class="cheat-header" style="${headerStyle}">
        <span style="color: white; font-size: 14px;">Cheat Console</span>
        <div style="${buttonContainerStyle}">
          <button id="collapseBtn" style="${headerButtonStyle}" title="Collapse">−</button>
          <button id="closeBtn" style="${headerButtonStyle}" title="Close">×</button>
        </div>
      </div>
    `;

    // Add content to the scrollable container

    let content = `
      <style>
        button:hover { background-color: #666 !important; }
        select:focus, input:focus { outline: none; border-color: #777; }
        .icon-option:hover { border-color: #666 !important; }
        .icon-option.selected { border-color: #00ff95 !important; }
        /* Scrollbar styles */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      </style>`;

    if (this._cheatConfigs.length) {
      content += `
        <div style="${sectionStyle}">
          <button id="applyConfig" style="${buttonStyle}">Apply</button>
          <button id="resetConfig" style="${buttonStyle}">Reset</button>
          <select id="configSelect" style="${selectStyle}">
            ${this._cheatConfigs
              .map((value) => `<option value="${value}">${value}</option>`)
              .join('')}
          </select>
        </div>
      `;
    }

    if (this._customCheatInput) {
      content += `
        <div style="${sectionStyle}">
          <button id="applyCustomCheat" style="${buttonStyle}">Apply</button>
          <button id="resetCustomCheat" style="${buttonStyle}">Reset</button>
          <input id="customCheat" type="text" placeholder="Custom cheat" style="${inputStyle}">
        </div>
      `;
    }

    if (this._cheatCommands.length) {
      content += `
        <div id="commands" style="${sectionStyle}">
          ${this._cheatCommands.map(
            (command) =>
              `<button id="${command}" style="${buttonStyle}">${formatCommandText(
                command
              )}</button>`
          )}
        </div>
      `;
    }

    content += `<div id="activeCheat" style="color: #00ff95; padding: 8px; margin: 8px 0; font-size: 12px; min-height: 16px; background: rgba(0,255,149,0.1); border-radius: 4px;"></div>`;

    if (this._cheatReels) {
      content += `
        <div style="${sectionStyle}">
          <div style="margin-bottom: 8px;">
            <button id="applyReels" style="${buttonStyle}">Apply</button>
            <button id="applyReelsOnce" style="${buttonStyle}">Apply Once</button>
            <button id="resetReels" style="${buttonStyle}">Reset</button>
          </div>
        
          <select id="predefinedReels" style="${selectStyle}">
            <option value="" disabled selected style="display: none">Predefined reel sets</option>
            ${predefinedReels.map(
              (reel) => `<option value="${JSON.stringify(reel.value)}">${reel.id}</option>`
            )}
          </select>
          ${this.hasIconSelection() ? '<div id="reelsPreview"></div>' : ''}
        </div>
  
        <div style="${sectionStyle}">
          <input type="text" id="reels" value="${JSON.stringify(
            predefinedReels[0]?.value || []
          )}" style="${inputStyle}">
        </div>
  
        ${
          this.hasIconSelection()
            ? `<div style="${sectionStyle}">
                ${this.createIconSelectionUI()}
               </div>`
            : ''
        }
      `;
    }

    content += `
      <div style="${sectionStyle}">
        <label style="color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px;">
          Fast spin
          <input type="checkbox" id="fastSpinMode" ${this._fastSpinMode ? 'checked' : ''}>
        </label>
      </div>
    `;

    this._contentEl.innerHTML = content;

    this._consoleEl.appendChild(this._contentEl);
    document.body.appendChild(this._consoleEl);

    // Add drag functionality
    this.initializeDrag();

    // Add collapse/close functionality
    this.getChildEl('#collapseBtn')?.addEventListener('click', () => this.toggleCollapse());
    this.getChildEl('#closeBtn')?.addEventListener('click', () => this.setShowState(false));

    this.getChildEl('#applyConfig')?.addEventListener('click', () => this.applyCfg());
    this.getChildEl('#resetConfig')?.addEventListener('click', () => this.resetCfg());

    this.getChildEl('#applyCustomCheat')?.addEventListener('click', () => this.applyCustomCheat());
    this.getChildEl('#resetCustomCheat')?.addEventListener('click', () => this.resetCustomCheat());

    this.getAllChildEl<HTMLButtonElement>('#commands button').forEach((button) => {
      button.addEventListener('click', (event) => {
        const commandId = (event.currentTarget as HTMLButtonElement).id;
        this.applyCommand(commandId);
      });
    });

    this.getChildEl('#fastSpinMode')?.addEventListener('change', () => this.setFastSpinMode());

    this.getChildEl('#predefinedReels')?.addEventListener('change', () =>
      this.applyPredefinedReelSet(predefinedReels)
    );

    this.getChildEl('#applyReels')?.addEventListener('click', () => this.applyReelSet());
    this.getChildEl('#applyReelsOnce')?.addEventListener('click', () => this.applyReelSet(true));
    this.getChildEl('#resetReels')?.addEventListener('click', () => this.resetReelSet());

    this.getChildEl('#reels')?.addEventListener('change', (e) => {
      const inputEl = e.target as HTMLInputElement;
      try {
        const reels = JSON.parse(inputEl.value);
        const previewEl = this.getChildEl<HTMLDivElement>('#reelsPreview');
        if (previewEl) {
          previewEl.innerHTML = this.createSymbolPreview(reels);
        }
      } catch (e) {
        // Invalid JSON, ignore preview update
      }
    });

    // Add icon selection event listeners
    const iconOptions = this._consoleEl.querySelectorAll('.icon-option');
    iconOptions.forEach((option) => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const iconId = target.dataset.icon;

        // Remove selected class from all options
        iconOptions.forEach((opt) => opt.classList.remove('selected'));
        // Add selected class to clicked option
        target.classList.add('selected');

        this._selectedIcon = iconId || null;
        const infoEl = this.getChildEl<HTMLDivElement>('#selectedIconInfo');
        if (infoEl) {
          infoEl.innerText = iconId ? `Selected icon: ${iconId}` : 'Selected: Empty icon';
        }
      });
    });

    // Add click handler for reels preview to replace icons
    const reelsPreviewEl = this.getChildEl<HTMLDivElement>('#reelsPreview');
    if (reelsPreviewEl) {
      reelsPreviewEl.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const symbolContainer = target.closest('.symbol-container') as HTMLElement;

        if (symbolContainer && this._selectedIcon !== null) {
          const reelsInput = this.getChildEl<HTMLInputElement>('#reels');
          if (reelsInput) {
            try {
              const reels = JSON.parse(reelsInput.value);
              const reelIndex = parseInt(symbolContainer.dataset.reel || '-1');
              const symbolIndex = parseInt(symbolContainer.dataset.symbol || '-1');

              if (reelIndex >= 0 && symbolIndex >= 0) {
                // Update the reels data with a single digit instead of an array
                reels[reelIndex][symbolIndex] =
                  this._selectedIcon === '' ? 0 : parseInt(this._selectedIcon);
                reelsInput.value = JSON.stringify(reels);

                // Update the preview
                reelsPreviewEl.innerHTML = this.createSymbolPreview(reels);
              }
            } catch (e) {
              console.error('Error updating reels:', e);
            }
          }
        }
      });
    }

    // Initialize preview for the first reel set
    if (predefinedReels.length > 0) {
      const previewEl = this.getChildEl<HTMLDivElement>('#reelsPreview');
      if (previewEl) {
        previewEl.innerHTML = this.createSymbolPreview(predefinedReels[0].value);
      }
    }

    this.handleOpenConsole();
  }

  public destroy(): void {
    if (this._consoleEl) {
      this._consoleEl.remove();
      this._consoleEl = null;
    }
  }

  private applyCfg(): void {
    const selectEl = this.getChildEl<HTMLSelectElement>('#configSelect');

    if (selectEl && selectEl.selectedOptions.length > 0) {
      this.setActiveCheat({
        type: CheatType.Cfg,
        value: selectEl.selectedOptions[0].label,
      });
    }
  }

  private resetCfg(): void {
    this.resetActiveCheatByType(CheatType.Cfg);
  }

  private applyCustomCheat(): void {
    const inputEl = this.getChildEl<HTMLInputElement>('#customCheat');

    if (inputEl && inputEl.value) {
      this.setActiveCheat({
        type: CheatType.Cfg,
        value: inputEl.value,
      });
    }
  }

  private resetCustomCheat(): void {
    this.resetActiveCheatByType(CheatType.Cfg);
  }

  private applyCommand(command: string): void {
    this.setActiveCheat({
      type: CheatType.Command,
      once: true,
      value: command,
    });
  }

  private setFastSpinMode(): void {
    const enabled = !!this.getChildEl<HTMLInputElement>('#fastSpinMode')?.checked;
    this.saveFastSpinMode(enabled);
    this._fastSpinMode = enabled;
  }

  private applyReelSet(once: boolean = false): void {
    const inputEl = this.getChildEl<HTMLInputElement>('#reels');
    const value = JSON.parse(inputEl?.value || '[]').map((l: string[]) => l.map((n: string) => n));

    this.setActiveCheat({
      type: CheatType.Reels,
      once,
      value,
    });
  }

  private resetReelSet(): void {
    this.resetActiveCheatByType(CheatType.Reels);
  }

  private applyPredefinedReelSet(predefinedReels: IPredefinedReel[]): void {
    const selectEl = this.getChildEl<HTMLSelectElement>('#predefinedReels');
    const inputEl = this.getChildEl<HTMLInputElement>('#reels');
    const previewEl = this.getChildEl<HTMLDivElement>('#reelsPreview');

    if (inputEl && selectEl && selectEl.selectedOptions.length > 0) {
      const id = selectEl.selectedOptions[0].label;
      const config = predefinedReels.find((reel) => reel.id === id);

      if (config) {
        inputEl.value = JSON.stringify(config.value);
        if (previewEl) {
          previewEl.innerHTML = this.createSymbolPreview(config.value);
        }
      }
    }
  }

  private getChildEl<T extends HTMLElement>(selector: string): T | null {
    return this._consoleEl?.querySelector(selector) || null;
  }

  private getAllChildEl<T extends HTMLElement>(selector: string): T[] {
    return this._consoleEl ? Array.from(this._consoleEl.querySelectorAll(selector)) : [];
  }

  private handleOpenConsole(): void {
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === Key.U) {
        this.toggleShownState();
      }
    });

    const view = this._container.forceResolve<SpinController>(T_ISpinController).view;
    view.spinBtn.longPressed.listen(() => this.toggleShownState());
  }

  private toggleShownState(): void {
    this.setShowState(!this._isShown);
  }

  private setShowState(isShown: boolean): void {
    this._isShown = isShown;
    if (this._consoleEl) {
      this._consoleEl.style.display = isShown ? 'block' : 'none';
      // Reset collapse state when showing
      if (isShown && this._isCollapsed) {
        this.toggleCollapse();
      }
    }
  }

  private setActiveCheat(data: ActiveCheat | null): void {
    this._activeCheat = data;
    const textEl = this.getChildEl<HTMLSpanElement>('#activeCheat');
    if (textEl) {
      textEl.innerText = data
        ? `Active cheat: ${data.type}; Data: ${JSON.stringify(data.value)}`
        : '';
    }
  }

  private resetActiveCheatByType(type: CheatType): void {
    if (this._activeCheat?.type === type) {
      this.setActiveCheat(null);
    }
  }

  private createIconSelectionUI(): string {
    const iconMap = this.getSymbolIconMap();
    let html = '<div style="margin-top: 12px;">';
    html +=
      '<div style="font-size: 12px; color: white; margin-bottom: 8px;">Select icon to replace:</div>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">';

    // Add empty icon option
    html += `<div class="icon-option" data-icon="" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border: 2px solid transparent; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
      <span style="color: white;">∅</span>
    </div>`;

    // Add only numeric icons
    Object.entries(iconMap).forEach(([symbolId, iconUrl]) => {
      // Only include if symbolId is a valid number
      if (!isNaN(Number(symbolId))) {
        html += `<div class="icon-option" data-icon="${symbolId}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border: 2px solid transparent; border-radius: 4px; cursor: pointer;">
          <img src="${iconUrl}" alt="Symbol ${symbolId}" style="width: 100%; height: 100%; object-fit: contain;">
        </div>`;
      }
    });

    html += '</div>';
    html +=
      '<div id="selectedIconInfo" style="font-size: 12px; color: #00ff95; margin-bottom: 8px;"></div>';
    html += '</div>';
    return html;
  }

  private createSymbolPreview(reels: number[][][]): string {
    const iconMap = this.getSymbolIconMap();
    let preview = '<div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0;">';

    reels.forEach((reel, reelIndex) => {
      preview += `<div class="reel-container" data-reel="${reelIndex}" style="display: flex; flex-direction: column; gap: 4px;">`;
      reel.forEach((symbol: number | number[], symbolIndex) => {
        // Handle both array and single number cases
        const symbolId = Array.isArray(symbol) ? symbol[0]?.toString() : symbol.toString();
        const iconUrl = iconMap[symbolId] || '';
        preview += `<div class="symbol-container" data-reel="${reelIndex}" data-symbol="${symbolIndex}" style="width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;">`;
        if (iconUrl) {
          preview += `<img src="${iconUrl}" alt="Symbol ${symbolId}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
        preview += '</div>';
      });
      preview += '</div>';
    });

    preview += '</div>';
    return preview;
  }

  private hasIconSelection(): boolean {
    return Object.keys(this.getSymbolIconMap()).length > 0;
  }

  private getSymbolIconMap(): Record<string, string> {
    return {};
  }

  private initializeDrag(): void {
    const header = this._consoleEl?.querySelector('.cheat-header');
    if (!header || !this._consoleEl) return;

    header.addEventListener('mousedown', ((e: MouseEvent) => {
      // Ignore if clicking buttons
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;

      const rect = this._consoleEl!.getBoundingClientRect();
      this._dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const onMouseMove = ((e: MouseEvent) => {
        if (!this._consoleEl) return;

        const x = e.clientX - this._dragOffset.x;
        const y = e.clientY - this._dragOffset.y;

        this._consoleEl.style.left = `${x}px`;
        this._consoleEl.style.top = `${y}px`;
        this._consoleEl.style.transform = 'none';
      }) as EventListener;

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        this.saveConsolePosition();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }) as EventListener);
  }

  private toggleCollapse(): void {
    this._isCollapsed = !this._isCollapsed;
    if (this._contentEl && this._consoleEl) {
      this._contentEl.style.display = this._isCollapsed ? 'none' : 'block';
      const collapseBtn = this.getChildEl('#collapseBtn');
      if (collapseBtn) {
        collapseBtn.textContent = this._isCollapsed ? '+' : '−';
      }
    }
  }

  private saveConsolePosition(): void {
    if (this._consoleEl) {
      const x = parseInt(this._consoleEl.style.left, 10);
      const y = parseInt(this._consoleEl.style.top, 10);

      localStorage.setItem(STORAGE_KEY.POSITION, JSON.stringify({ x, y }));
    }
  }

  private restoreConsolePosition(): void {
    const positionStr = localStorage.getItem(STORAGE_KEY.POSITION);

    if (positionStr && this._consoleEl) {
      try {
        const position = JSON.parse(positionStr);

        if (typeof position.x === 'number' && typeof position.y === 'number') {
          this._consoleEl.style.left = `${position.x}px`;
          this._consoleEl.style.top = `${position.y}px`;
          this._consoleEl.style.transform = 'none';
        }
      } catch {
        //
      }
    }
  }

  private saveFastSpinMode(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY.FAST_SPIN, enabled.toString());
  }

  private getSavedFastSpinMode(): boolean {
    return localStorage.getItem(STORAGE_KEY.FAST_SPIN) === 'true';
  }
}
