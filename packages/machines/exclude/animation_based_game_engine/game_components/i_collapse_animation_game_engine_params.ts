import { IAnimationGameEngineParams } from 'machines';

export interface ICollapseAnimationGameEngineParams extends IAnimationGameEngineParams {
  collapsePlaceholderNodeId: string;
  collapseHideAnimName: string;
  collapseShowAnimName: string;
}
