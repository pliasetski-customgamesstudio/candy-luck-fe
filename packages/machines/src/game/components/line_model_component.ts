import { Container } from '@cgs/syd';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { LineModel } from '../../reels_engine/line_model';
import { ILinesModelProvider } from './interfaces/i_lines_model_provider';
import { ResourcesComponent } from './resources_component';
import { T_ISlotGame, T_ResourcesComponent } from '../../type_definitions';

export class LineModelComponent implements ILinesModelProvider {
  lineModel: LineModel;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const game: ISlotGame = container.forceResolve<ISlotGame>(T_ISlotGame);
    const res: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const lw = res.slot.findById('line_width')!;
    if (game.linesConfig) {
      this.lineModel = new LineModel(game.linesConfig, game.symbolsBounds, lw.size.x);
    }
  }
}
