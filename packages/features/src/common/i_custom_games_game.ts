import { IRootObjectHolder } from './i_root_object_holder';
import { SceneBuilder } from '@cgs/syd';
import { ICoordinateSystemInfoProvider, IOperationContext } from '@cgs/common';

export const T_ICustomGamesGame = Symbol('ICustomGamesGame');
export interface ICustomGamesGame extends IRootObjectHolder {
  get coordinateSystemInfoProvider(): ICoordinateSystemInfoProvider;
  get sceneBuilder(): SceneBuilder;
  get rootContext(): IOperationContext;
}
