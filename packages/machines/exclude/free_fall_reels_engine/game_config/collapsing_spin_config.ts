import { CollapsingParameters } from 'package:machines/src/reels_engine_library';

class CollapsingSpinConfig {
  collapsingParameters: CollapsingParameters;

  constructor(configDto: any) {
    if (configDto) {
      if (configDto.hasOwnProperty('collapsingParameters')) {
        this.collapsingParameters = new CollapsingParameters(configDto['collapsingParameters']);
      }
    }
  }
}
