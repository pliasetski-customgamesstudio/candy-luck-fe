import { SlotParams } from '../../reels_engine/slot_params';
import { IconDescr } from '../../reels_engine/long_icon_enumerator';

export class ExtendedSlotGameParams extends SlotParams {
  private readonly _maxSlotIconId: number;
  private readonly _waysCount: number = 0;
  private readonly _symbolsThatNotAppearNearSameSymbols: number[];
  private readonly _uniqueSymbolOnReels: number[];
  private readonly _replaceIconId: number = 0;
  private readonly _shortWinLinesSpecificSpecGroup: string[];
  private readonly _playWinPositionsTypes: string[];
  private readonly _epicWinAfterShortWinLines: boolean = false;
  private readonly _soundMap: Map<number, number>;
  private readonly _anticipationEnabled: boolean = false;
  private readonly _stbEnbled: boolean;
  private readonly _disableScissorDuringSTB: boolean = false;
  private readonly _iconsWithValuesEnabled: boolean = false;
  private readonly _additionalLoaderFiles: string[];

  constructor(
    gameId: string,
    reelsCount: number,
    linesCount: number,
    maxSlotIconId: number,
    additionalLoaderFiles: string[],
    {
      iconsWithValuesEnabled = false,
      epicWinAfterShortWinLines = false,
      stbEnabled = true,
      disableScissorDuringSTB = false,
      anticipationEnabled = true,
      shortWinLinesSpecificSpecGroup = [],
      playWinPositionsTypes = [],
      longIcons = [],
      waysCount = 0,
      symbolsThatNotAppearNearSameSymbols = [],
      uniqueSymbolOnReels = [],
      replaceIconId = 6,
      soundMap = new Map(),
    }: {
      iconsWithValuesEnabled?: boolean;
      epicWinAfterShortWinLines?: boolean;
      stbEnabled?: boolean;
      disableScissorDuringSTB?: boolean;
      anticipationEnabled?: boolean;
      shortWinLinesSpecificSpecGroup?: string[];
      playWinPositionsTypes?: string[];
      longIcons?: IconDescr[];
      waysCount?: number;
      symbolsThatNotAppearNearSameSymbols?: number[];
      uniqueSymbolOnReels?: number[];
      replaceIconId?: number;
      soundMap?: Map<number, number>;
    }
  ) {
    super(gameId, reelsCount, linesCount, longIcons);
    this._additionalLoaderFiles = additionalLoaderFiles;
    this._iconsWithValuesEnabled = iconsWithValuesEnabled;
    this._stbEnbled = stbEnabled;
    this._disableScissorDuringSTB = disableScissorDuringSTB;
    this._anticipationEnabled = anticipationEnabled;
    this._epicWinAfterShortWinLines = epicWinAfterShortWinLines;
    this._shortWinLinesSpecificSpecGroup = shortWinLinesSpecificSpecGroup;
    this._playWinPositionsTypes = playWinPositionsTypes;
    this._waysCount = waysCount;
    this._maxSlotIconId = maxSlotIconId;
    this._uniqueSymbolOnReels = uniqueSymbolOnReels;
    this._replaceIconId = replaceIconId;
    this._symbolsThatNotAppearNearSameSymbols = symbolsThatNotAppearNearSameSymbols;
    if (!this._symbolsThatNotAppearNearSameSymbols) {
      this._symbolsThatNotAppearNearSameSymbols = [];
    }
    this._soundMap = soundMap;
  }

  get maxSlotIconId(): number {
    return this._maxSlotIconId;
  }
  get waysCount(): number {
    return this._waysCount;
  }

  get symbolsThatNotAppearNearSameSymbols(): number[] {
    return this._symbolsThatNotAppearNearSameSymbols;
  }

  get uniqueSymbolOnReels(): number[] {
    return this._uniqueSymbolOnReels;
  }

  get replaceIconId(): number {
    return this._replaceIconId;
  }

  get shortWinLinesSpecificSpecGroup(): string[] {
    return this._shortWinLinesSpecificSpecGroup;
  }

  get playWinPositionsTypes(): string[] {
    return this._playWinPositionsTypes;
  }

  get epicWinAfterShortWinLines(): boolean {
    return this._epicWinAfterShortWinLines;
  }

  get soundMap(): Map<number, number> {
    return this._soundMap;
  }

  get anticipationEnabled(): boolean {
    return this._anticipationEnabled;
  }

  get stbEnbled(): boolean {
    return this._stbEnbled;
  }

  get disableScissorDuringSTB(): boolean {
    return this._disableScissorDuringSTB;
  }

  get iconsWithValuesEnabled(): boolean {
    return this._iconsWithValuesEnabled;
  }

  get additionalLoaderFiles(): string[] {
    return this._additionalLoaderFiles;
  }
}
