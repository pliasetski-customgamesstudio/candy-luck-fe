import { IRoundComponent } from './i_round_component';
import { SelectAction } from '../enums/select_action';
import { SelectionInfo } from './selection_info';
import { SelectionArgs } from '../messaging/selection_args';
import { EventStream } from '@cgs/syd';

export interface IButtonsComponent extends IRoundComponent {
  selectAction: SelectAction;
  context: SelectionInfo;
  OnTouch: EventStream<SelectionArgs>;
  disable(): void;
}
