import { Container, SceneObject } from '@cgs/syd';
import { EpicWinConfiguration } from './epic_win/epic_win_configuration';
import { EpicWinPopupView } from '../common/slot/views/epic_win_popup_view';

export class CustomEpicWinPopupView extends EpicWinPopupView {
  constructor(
    container: Container,
    root: SceneObject,
    popup: SceneObject,
    soundNode: SceneObject | null,
    configuration: EpicWinConfiguration
  ) {
    super(container, root, popup, soundNode, configuration);
  }
}
