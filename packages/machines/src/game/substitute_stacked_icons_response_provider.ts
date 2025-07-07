import { SpinResponseProvider } from './slot_response_provider';
import { SubstituteIconItem } from './components/substitute_icon_componenent';
import { Container } from '@cgs/syd';
import { IGameParams } from '../reels_engine/interfaces/i_game_params';
import { T_IGameParams, T_ISlotSessionProvider } from '../type_definitions';
import { ISlotSessionProvider } from './components/interfaces/i_slot_session_provider';
import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { SpinResultResponse } from '@cgs/network';

export class SubstituteStackedIconsResponseProvider extends SpinResponseProvider<ISpinResponse> {
  private _marker: string;
  private _substituteIconItems: SubstituteIconItem[];
  private _reelsCount: number;
  private _linesCount: number;
  private _wildIconIds: number[];

  constructor(
    container: Container,
    gameParams: IGameParams,
    marker: string,
    substituteIconItems: SubstituteIconItem[]
  ) {
    super(container, gameParams);
    this._marker = marker;
    this._substituteIconItems = substituteIconItems;
    this._reelsCount = container.forceResolve<IGameParams>(T_IGameParams).groupsCount;
    this._linesCount = container.forceResolve<IGameParams>(T_IGameParams).maxIconsPerGroup;
  }

  get wildIconIds(): number[] {
    if (!this._wildIconIds) {
      const sloSession =
        this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
      this._wildIconIds = sloSession.machineInfo.symbols
        .filter((s) => s.type === 'wild' || s.type === 'alternativeWild')
        .map((s) => s.id);
    }

    return this._wildIconIds;
  }

  public toInternalResponse(spinResult: SpinResultResponse): ISpinResponse {
    const response = super.toInternalResponse(spinResult);

    if (!response.viewReels || !response.winLines) {
      return response;
    }

    const winLinePositionsCount = response.winLines
      ? response.winLines.flatMap((l) => l.iconsIndexes).length
      : 0;

    const substituteCandidates = this._substituteIconItems.filter(
      (i) => i.iconDescr.length * i.iconDescr.width <= winLinePositionsCount
    );
    this._substituteIconItems.sort(
      (i1, i2) =>
        i2.iconDescr.length * i2.iconDescr.width - i1.iconDescr.length * i1.iconDescr.width
    );

    for (const substituteItem of substituteCandidates) {
      const allowedIconIds = [...this.wildIconIds];
      allowedIconIds.push(substituteItem.symbolId);
      let allowWilds =
        response.winLines.map((l) => l.symbolId!).filter((i) => !this.wildIconIds.includes(i))
          .length > 0;
      let wildWin = 0;
      let otherWin = 0;
      for (const winLine of response.winLines) {
        if (this.wildIconIds.includes(winLine.symbolId!)) {
          wildWin += winLine.winAmount * winLine.multiplier!;
        } else {
          otherWin += winLine.winAmount * winLine.multiplier!;
        }
      }
      if (wildWin > otherWin) {
        allowWilds = false;
      }

      const positions = this.getSubstituteIconPosition(response, substituteItem, allowWilds);
      if (positions.length > 0) {
        if (!response.specialSymbolGroups) {
          response.specialSymbolGroups = [];
        }

        if (
          response.specialSymbolGroups.filter(
            (s) => s.type === this._marker && s.symbolId === substituteItem.symbolId
          ).length === 0
        ) {
          const symbol: SpecialSymbolGroup = new SpecialSymbolGroup();
          symbol.type = this._marker;
          symbol.symbolId = substituteItem.symbolId;
          symbol.positions = [];

          response.specialSymbolGroups.push(symbol);
        }

        const group = response.specialSymbolGroups.find((s) => s.type === this._marker)!;
        if (
          positions.filter((p) => !group.positions!.includes(p)).length > 0 ||
          group.positions!.filter((p) => !positions.includes(p)).length > 0
        ) {
          group.positions = positions;
        }

        break;
      }
    }

    return response;
  }

  private getSubstituteIconPosition(
    response: ISpinResponse,
    substituteIconItem: SubstituteIconItem,
    allowWilds: boolean
  ): number[] {
    // Find possible positions where top left side of a big icon can be located
    const possibleTopLeftReels = Array.from(
      { length: this._reelsCount - substituteIconItem.iconDescr.width + 1 },
      (_, i) => i
    );
    const possibleTopLeftLines = Array.from(
      { length: this._linesCount - substituteIconItem.iconDescr.length + 1 },
      (_, i) => i
    );
    const possibleTopLeftPositions = possibleTopLeftReels.flatMap((r) =>
      possibleTopLeftLines.map((l) => l * this._linesCount + r)
    );
    possibleTopLeftPositions.sort((p1, p2) => p1 - p2);

    const spoiledPositions: number[] = [];
    let resultPosition = -1;
    for (const position of possibleTopLeftPositions) {
      if (spoiledPositions.includes(position)) {
        continue;
      }

      let leftBorderReel = position % this._reelsCount;
      let topBorderLine = Math.floor(position / this._reelsCount);
      let rightBorderReel = leftBorderReel + substituteIconItem.iconDescr.width - 1;
      let bottomBorderLine = topBorderLine + substituteIconItem.iconDescr.length - 1;
      let currentReel = leftBorderReel;
      let currentLine = topBorderLine;

      const iconPositionsCount =
        substituteIconItem.iconDescr.length * substituteIconItem.iconDescr.width;
      let matchIconCount = 0;
      let notOnlyWildIcons = false;
      while (matchIconCount < iconPositionsCount) {
        const iconId =
          response.viewReels[currentReel][currentLine] > 100
            ? Math.floor(response.viewReels[currentReel][currentLine] / 100)
            : response.viewReels[currentReel][currentLine];

        if (
          iconId === substituteIconItem.symbolId ||
          (allowWilds && this.wildIconIds.includes(iconId))
        ) {
          if (iconId === substituteIconItem.symbolId) {
            notOnlyWildIcons = true;
          }

          matchIconCount++;
          if (matchIconCount === iconPositionsCount) {
            resultPosition = position;
          }

          if (currentReel === leftBorderReel && currentLine < bottomBorderLine) {
            currentLine++;
          } else if (currentLine === bottomBorderLine && currentReel < rightBorderReel) {
            currentReel++;
          } else if (currentReel === rightBorderReel && currentLine > topBorderLine) {
            currentLine--;
          } else if (currentLine === topBorderLine && currentReel > leftBorderReel) {
            if (currentReel === leftBorderReel + 1) {
              leftBorderReel++;
              rightBorderReel--;
              topBorderLine++;
              bottomBorderLine--;
              currentLine++;
            } else {
              currentReel--;
            }
          }
        } else {
          spoiledPositions.push(
            ...possibleTopLeftPositions.filter(
              (p) => p % this._reelsCount <= currentReel && p / this._reelsCount <= currentLine
            )
          );
          break;
        }
      }

      if (resultPosition >= 0 && !notOnlyWildIcons) {
        resultPosition = -1;
      }

      if (resultPosition >= 0) {
        break;
      }
    }

    if (resultPosition < 0) {
      return [];
    }

    const resultReel = resultPosition % this._reelsCount;
    const resultLine = Math.floor(resultPosition / this._reelsCount);

    const result: number[] = [];
    for (let reel = resultReel; reel < resultReel + substituteIconItem.iconDescr.width; reel++) {
      for (let line = resultLine; line < resultLine + substituteIconItem.iconDescr.length; line++) {
        result.push(line * this._reelsCount + reel);
      }
    }

    return result;
  }
}
