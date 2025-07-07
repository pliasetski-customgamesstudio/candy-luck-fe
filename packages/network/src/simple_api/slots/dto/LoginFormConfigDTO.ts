export const enum LoginFormConfigTrigger {
  AfterSpin = 'afterSpin',
  AfterWin = 'afterWin',
  AfterBigWin = 'afterBigWin',
  AfterJackPot = 'afterJackPot',
  BeforeBonus = 'beforeBonus',
  FreeSpinsStart = 'freeSpinsStart',
  FreeSpinsEnd = 'freeSpinsEnd',
}

interface ILoginFormConfigDTO {
  firstShowTimeout: number;
  showTimeout: number;
  triggers: LoginFormConfigTrigger[];
}

export class LoginFormConfigDTO implements ILoginFormConfigDTO {
  firstShowTimeout: number;
  showTimeout: number;
  triggers: LoginFormConfigTrigger[];

  constructor(firstShowTimeout: number, showTimeout: number, triggers: LoginFormConfigTrigger[]) {
    this.firstShowTimeout = firstShowTimeout;
    this.showTimeout = showTimeout;
    this.triggers = triggers;
  }

  static fromJson(json: ILoginFormConfigDTO): LoginFormConfigDTO {
    return new LoginFormConfigDTO(json.firstShowTimeout, json.showTimeout, json.triggers);
  }
}
