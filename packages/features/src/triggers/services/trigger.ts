class Trigger {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  static readonly Login = new Trigger('login');
  static readonly BigWin = new Trigger('big_win');
  static readonly FreeSpinsBigWin = new Trigger('fs_big_win');
  static readonly MegaWin = new Trigger('mega_win');
  static readonly FreeSpinsMegaWin = new Trigger('fs_mega_win');
  static readonly EpicWin = new Trigger('epic_win');
  static readonly FreeSpinsEpicWin = new Trigger('fs_epic_win');
  static readonly BackToLobby = new Trigger('back_to_lobby');
  static readonly FreeSpins = new Trigger('free_spins');
  static readonly BonusGame = new Trigger('bonus_game');
  static readonly OnNotEnoughCoins = new Trigger('on_not_enough_coins');
  static readonly None = new Trigger('none');

  static readonly values: Trigger[] = [
    Trigger.Login,
    Trigger.BigWin,
    Trigger.FreeSpinsBigWin,
    Trigger.MegaWin,
    Trigger.FreeSpinsMegaWin,
    Trigger.EpicWin,
    Trigger.FreeSpinsEpicWin,
    Trigger.BackToLobby,
    Trigger.FreeSpins,
    Trigger.BonusGame,
    Trigger.OnNotEnoughCoins,
    Trigger.None,
  ];

  static getValueFromDescription(description: string): Trigger {
    return Trigger.values.find((v) => v.value === description) || Trigger.None;
  }
}
