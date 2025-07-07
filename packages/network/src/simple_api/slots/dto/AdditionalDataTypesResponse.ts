import { BaseSpecGroupDTO } from './BaseSpecGroupDTO';
import { CollapsingRoundDTO } from './CollapsingRoundDTO';
import { CollapsingSpecGroupDTO } from './CollapsingSpecGroupDTO';
import { ExtraWinSymbolsSpecGroupDTO } from './ExtraWinSymbolsSpecGroupDTO';
import { JackPotsSpecGroupDTO } from './JackPotsSpecGroupDTO';
import { MonopolyGroupDTO } from './MonopolyGroupDTO';
import { MovingSymbolsDTO } from './MovingSymbolsDTO';
import { MultiSpinGroupDTO } from './MultiSpinGroupDTO';
import { PokerWinLineDTO } from './PokerWinLineDTO';
import { PokerWinLinesAdditionalDataDTO } from './PokerWinLinesAdditionalDataDTO';
import { PositionsSpecGroupDTO } from './PositionsSpecGroupDTO';
import { ReSpinGroupDTO } from './ReSpinGroupDTO';
import { ReSpinRoundDTO } from './ReSpinRoundDTO';
import { WinLineDTO } from './WinLineDTO';

export class AdditionalDataTypesResponse {
  baseSpecGroup: BaseSpecGroupDTO | null;
  collapsingRound: CollapsingRoundDTO | null;
  collapsingSpecGroup: CollapsingSpecGroupDTO | null;
  extraWinSymbolsSpecGroup: ExtraWinSymbolsSpecGroupDTO | null;
  jackPotsSpecGroup: JackPotsSpecGroupDTO | null;
  monopolyGroup: MonopolyGroupDTO | null;
  movingSymbols: MovingSymbolsDTO | null;
  multiSpinGroup: MultiSpinGroupDTO | null;
  pokerWinLine: PokerWinLineDTO | null;
  pokerWinLines: PokerWinLinesAdditionalDataDTO | null;
  positionSpecGroup: PositionsSpecGroupDTO | null;
  reSpinGroup: ReSpinGroupDTO | null;
  reSpinRound: ReSpinRoundDTO | null;
  winLine: WinLineDTO | null;

  constructor({
    baseSpecGroup,
    collapsingRound,
    collapsingSpecGroup,
    extraWinSymbolsSpecGroup,
    jackPotsSpecGroup,
    monopolyGroup,
    movingSymbols,
    multiSpinGroup,
    pokerWinLine,
    pokerWinLines,
    positionSpecGroup,
    reSpinGroup,
    reSpinRound,
    winLine,
  }: {
    baseSpecGroup: BaseSpecGroupDTO | null;
    collapsingRound: CollapsingRoundDTO | null;
    collapsingSpecGroup: CollapsingSpecGroupDTO | null;
    extraWinSymbolsSpecGroup: ExtraWinSymbolsSpecGroupDTO | null;
    jackPotsSpecGroup: JackPotsSpecGroupDTO | null;
    monopolyGroup: MonopolyGroupDTO | null;
    movingSymbols: MovingSymbolsDTO | null;
    multiSpinGroup: MultiSpinGroupDTO | null;
    pokerWinLine: PokerWinLineDTO | null;
    pokerWinLines: PokerWinLinesAdditionalDataDTO | null;
    positionSpecGroup: PositionsSpecGroupDTO | null;
    reSpinGroup: ReSpinGroupDTO | null;
    reSpinRound: ReSpinRoundDTO | null;
    winLine: WinLineDTO | null;
  }) {
    this.baseSpecGroup = baseSpecGroup;
    this.collapsingRound = collapsingRound;
    this.collapsingSpecGroup = collapsingSpecGroup;
    this.extraWinSymbolsSpecGroup = extraWinSymbolsSpecGroup;
    this.jackPotsSpecGroup = jackPotsSpecGroup;
    this.monopolyGroup = monopolyGroup;
    this.movingSymbols = movingSymbols;
    this.multiSpinGroup = multiSpinGroup;
    this.pokerWinLine = pokerWinLine;
    this.pokerWinLines = pokerWinLines;
    this.positionSpecGroup = positionSpecGroup;
    this.reSpinGroup = reSpinGroup;
    this.reSpinRound = reSpinRound;
    this.winLine = winLine;
  }

  static fromJson(json: any): AdditionalDataTypesResponse {
    return new AdditionalDataTypesResponse({
      baseSpecGroup: json['baseSpecGroup']
        ? BaseSpecGroupDTO.fromJson(json['baseSpecGroup'])
        : null,
      collapsingRound: json['collapsingRound']
        ? CollapsingRoundDTO.fromJson(json['collapsingRound'])
        : null,
      collapsingSpecGroup: json['collapsingSpecGroup']
        ? CollapsingSpecGroupDTO.fromJson(json['collapsingSpecGroup'])
        : null,
      extraWinSymbolsSpecGroup: json['extraWinSymbolsSpecGroup']
        ? ExtraWinSymbolsSpecGroupDTO.fromJson(json['extraWinSymbolsSpecGroup'])
        : null,
      jackPotsSpecGroup: json['jackPotsSpecGroup']
        ? JackPotsSpecGroupDTO.fromJson(json['jackPotsSpecGroup'])
        : null,
      monopolyGroup: json['monopolyGroup']
        ? MonopolyGroupDTO.fromJson(json['monopolyGroup'])
        : null,
      movingSymbols: json['movingSymbols']
        ? MovingSymbolsDTO.fromJson(json['movingSymbols'])
        : null,
      multiSpinGroup: json['multiSpinGroup']
        ? MultiSpinGroupDTO.fromJson(json['multiSpinGroup'])
        : null,
      pokerWinLine: json['pokerWinLine'] ? PokerWinLineDTO.fromJson(json['pokerWinLine']) : null,
      pokerWinLines: json['pokerWinLines']
        ? PokerWinLinesAdditionalDataDTO.fromJson(json['pokerWinLines'])
        : null,
      positionSpecGroup: json['positionSpecGroup']
        ? PositionsSpecGroupDTO.fromJson(json['positionSpecGroup'])
        : null,
      reSpinGroup: json['reSpinGroup'] ? ReSpinGroupDTO.fromJson(json['reSpinGroup']) : null,
      reSpinRound: json['reSpinRound'] ? ReSpinRoundDTO.fromJson(json['reSpinRound']) : null,
      winLine: json['winLine'] ? WinLineDTO.fromJson(json['winLine']) : null,
    });
  }
}
