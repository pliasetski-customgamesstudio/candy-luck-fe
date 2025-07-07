import { IOperation } from '@cgs/common';
import { TopPanelContainerType } from './top_panel_container_type';

export interface ITopPanelContainerOperation extends IOperation {
  containerType: TopPanelContainerType;
}
