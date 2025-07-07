import { AnimationGameEngineParams } from 'machines';

export interface ICollapseAnimationGameEngineParams {
  collapsePlaceholderNodeId: string;
  collapseHideAnimName: string;
  collapseShowAnimName: string;
}

class CollapseAnimationGameEngineParams
  extends AnimationGameEngineParams
  implements ICollapseAnimationGameEngineParams
{
  collapsePlaceholderNodeId: string;
  collapseHideAnimName: string;
  collapseShowAnimName: string;
}
