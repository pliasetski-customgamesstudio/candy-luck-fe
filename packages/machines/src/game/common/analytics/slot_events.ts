export class SlotEvents {
  static readonly SpinDuration: string = 'SpinDuration';
  static readonly SpinResponseDuration: string = 'SpinResponseDuration';
  static readonly SpinCount: string = 'SpinCount';

  static readonly SpinInterval: string = 'SpinInterval';
  static readonly WinLinesDuration: string = 'WinLinesDuration';
  static readonly IdleDuration: string = 'IdleDuration';
  static readonly FirstReelStopDuration: string = 'FirstReelStopDuration';
  static readonly FirstReelStopStats: string = 'FirstReelStopStats';
  static readonly AfterServerFirstReelStopStats: string = 'AfterServerFirstReelStopStats';

  static readonly AutoSpinCount: string = 'AutoSpinCount'; // immediate event with event_value = chosen count. -1 for infinity
  static readonly AutoSpinActivated: string = 'AutoSpinActivated';
  static readonly LostConnection: string = 'LostConnection';

  static readonly SpinButton: string = 'ButtonSpin';
  static readonly SpinKey: string = 'KeySpin';
  static readonly SpinSwipe: string = 'SwipeSpin';
  static readonly SpinAuto: string = 'AutoSpin';
  static readonly SpinFreeSpins: string = 'FreeSpin';
  static readonly MaxBetButton: string = 'MaxBetButton';
  static readonly XtremeMaxBetButton: string = 'XtremeMaxBetButton';

  static readonly ForceStop: string = 'ForceStop';
  static readonly StopAutoSpin: string = 'StopAutoSpins';

  static readonly SessionDuration: string = 'SessionDuration';
  static readonly SlotSettingsOpen: string = 'SettingsOpen';
  static readonly HoldSlotSettings: string = 'HoldSlotSettings';
  static readonly HoldSlotSettingsTicks: string = 'HoldSlotSettingsTicks';
  static readonly PaytablePopupOpen: string = 'PaytablePopupOpen';
  static readonly PaytableOnSlotShow: string = 'PaytableOnSlotShow';
  static readonly WinLinesThroughIconShow: string = 'WinLinesThroughIconShow';

  static readonly BonusCount: string = 'BonusCount';
  static readonly BonusRecoveryCount: string = 'BonusRecoveryCount';
  static readonly ScatterCount: string = 'ScatterCount';
  static readonly ScatterRecoveryCount: string = 'ScatterRecoveryCount';
  static readonly GambleCount: string = 'GambleCount';
  static readonly WinCombination: string = 'WinCombination';

  static readonly SkipProgressiveBonusAnimation: string = 'ProgressiveBonusAnimationSkip';
  static readonly SkipEpicWinAnimation: string = 'EpicWinPopupSkip';
  static readonly SkipInstantCoinsPopup: string = 'InstantCoinsPopupSkip';
  static readonly SkipFeatureAnimation: string = 'SkipFeature_{0}';
  static readonly ShowEpicWinPopup: string = 'EpicWinPopupShow';

  static readonly RegularSpinFps: string = 'RegularSpinFps';
  static readonly FreeSpinFps: string = 'FreeSpinFps';
  static readonly RegularWinAnimationFps: string = 'RegularWinLinesFps';
  static readonly FreeSpinWinAnimationFps: string = 'FreeSpinWinLinesFps';
  static readonly BonusFps: string = 'BonusGameFps';
  static readonly ScatterGambleFps: string = 'ScatterGambleFps';

  static readonly LowVolatilitySpins: string = 'LowVolatilitySpins';
  static readonly MediumVolatilitySpins: string = 'MediumVolatilitySpins';
  static readonly HighVolatilitySpins: string = 'HighVolatilitySpins';

  static readonly FastSpinsEnableClick: string = 'FastSpinsEnableClick';
  static readonly FastSpinsDisableClick: string = 'FastSpinsDisableClick';
  static readonly FastSpinsCount: string = 'FastSpinsCount';
}
