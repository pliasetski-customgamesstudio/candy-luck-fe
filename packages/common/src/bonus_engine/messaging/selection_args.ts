import { SelectAction } from '../enums/select_action';

export class SelectionArgs {
  selectAction: SelectAction | null;
  selectedIndex: number;
  buttonsSetName: string;
  sendValue: number | null;
  serverIndex: number;

  constructor(
    buttonName: string,
    selectAction: SelectAction | null,
    selectedIndex: number,
    sendValue: number | null = null
  ) {
    this.buttonsSetName = buttonName;
    this.selectAction = selectAction;
    this.selectedIndex = selectedIndex;
    this.sendValue = sendValue;
  }
}
