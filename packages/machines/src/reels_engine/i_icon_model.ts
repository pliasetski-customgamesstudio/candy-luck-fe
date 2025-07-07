import { SceneObject } from '@cgs/syd';

export interface IIconModel {
  getStaticIcon(iconIndex: number): SceneObject[];
  getBluredStaticIcon(iconIndex: number): SceneObject[];
  getAnimIcon(iconIndex: number): SceneObject[];
  hasStaticIcon(iconId: number): boolean;
  dispose(): void;
}
