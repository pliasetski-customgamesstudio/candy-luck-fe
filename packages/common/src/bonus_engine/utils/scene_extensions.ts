import { SceneObject } from '@cgs/syd';

export class SceneExtensions {
  static FindByUniqueId(root: SceneObject, id: string): SceneObject | null {
    const ids = id.split('.');
    let element: SceneObject | null = root;
    for (const id of ids) {
      if (!element) {
        return null;
      }
      element = element.findById(id);
    }
    return element;
  }

  static FindAllByUniqueId(root: SceneObject, id: string): SceneObject[] {
    const ids = id.split('.');
    let elements: SceneObject[] = [root];
    for (let i = 0; i < ids.length - 1; i++) {
      const curElements: SceneObject[] = [];
      for (const element of elements) {
        const subElements = element.findAllById(ids[i]);
        if (subElements.length > 0) {
          curElements.push(...subElements);
        }
      }
      elements = curElements;
    }

    const elementList: SceneObject[] = [];
    for (const element of elements) {
      const els = element.findAllById(ids[ids.length - 1]);
      elementList.push(...els);
    }
    return elementList;
  }

  static CombineToUniqueId(firstId: string, secondId: string, separator: string = '.'): string {
    return `${firstId}${separator}${secondId}`;
  }

  static GetUniqueId(element: SceneObject, rootScene: SceneObject): string | null {
    if (!element.id) {
      return null;
    }

    let uniqueId = element.id;

    let parent = element.parent;

    while (!SceneExtensions.IsIdUnique(rootScene, uniqueId) && parent) {
      if (parent === rootScene) {
        throw new Error(
          "There are two or more elements with the same ids that can't be distinguished"
        );
      }

      if (parent.id) {
        uniqueId = SceneExtensions.CombineToUniqueId(parent.id, uniqueId);
      }
      parent = parent.parent;
    }
    return uniqueId;
  }

  static IsIdUnique(scene: SceneObject, uniqueId: string, separator: string = '.'): boolean {
    const ids = uniqueId.split(separator);

    let element: SceneObject = scene;

    for (const id of ids) {
      const elements = element.findAllById(id);

      if (elements.length > 1) {
        return false;
      }
      element = elements[0];
    }
    return true;
  }
}
