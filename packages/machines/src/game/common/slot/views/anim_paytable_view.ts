import { Container, SceneObject, Vector2 } from '@cgs/syd';
import { AbstractIconResourceProvider } from '../../../components/abstract_icon_resource_provider';
import { T_AbstractIconResourceProvider } from '../../../../type_definitions';
import { PaytableView } from './paytable_view';

export class AnimPaytableView extends PaytableView {
  constructor(
    container: Container,
    _root: SceneObject,
    _popupView: SceneObject,
    private useIconResourceProvider: boolean,
    private clearEffects: boolean,
    private resetPosition: boolean
  ) {
    super(container, _root.parent!, _popupView);

    const resourceProvider: AbstractIconResourceProvider =
      container.forceResolve<AbstractIconResourceProvider>(T_AbstractIconResourceProvider);
    const iconsScene = resourceProvider.sceneFactory!.build('slot/icons')!;
    if (iconsScene) {
      iconsScene.initialize();
      const render = iconsScene.findById('render');
      if (render) {
        render.parent!.removeChild(render);
        _popupView.addChild(render);
      }
    }

    for (let i = 0; i < 30; ++i) {
      const iconNodes = useIconResourceProvider
        ? resourceProvider.getIconNodes('icon_' + i.toString())
        : iconsScene.findAllById('icon_' + i.toString());

      const viewNode = _popupView.findById('icon_' + i.toString());

      if (iconNodes && viewNode) {
        iconNodes.forEach((iconNode) => {
          if (clearEffects) {
            iconNode.effect = null;
          }
          if (iconNode.parent) {
            iconNode.parent.removeChild(iconNode);
          }
          if (resetPosition) {
            iconNode.position = new Vector2(0.0, 0.0);
          }
          iconNode.z = 999;
          viewNode.addChild(iconNode);
        });
      }
    }
  }
}
