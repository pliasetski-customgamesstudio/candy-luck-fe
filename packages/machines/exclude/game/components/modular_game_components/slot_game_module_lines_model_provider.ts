import { Container } from 'inversify';
import { ILinesModelProvider } from 'machines';
import { ISlotGameModule, BaseSlotGameModule } from 'machines';
import { ResourcesComponent } from 'syd';
import { LineModel } from 'machines/src/reels_engine_library';

class SlotGameModuleLinesModelProvider implements ILinesModelProvider {
  lineModel: LineModel;
  constructor(container: Container) {
    console.log('load ' + this.constructor.name);
    const module = container.resolve<ISlotGameModule>(ISlotGameModule);
    const res = container.resolve<ResourcesComponent>(ResourcesComponent);
    const lw = res.slot.findById('line_width');
    if (module instanceof BaseSlotGameModule && module.linesConfig) {
      this.lineModel = new LineModel(module.linesConfig, module.symbolsBounds, lw.size.x);
    }
  }
}
