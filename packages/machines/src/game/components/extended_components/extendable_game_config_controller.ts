import { Func1 } from '@cgs/shared';
import { Container } from '@cgs/syd';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { GameConfigController } from '../game_config_controller';

export class ExtendableGameConfigController extends GameConfigController {
  constructor(
    container: Container,
    responsePostProcessor: Func1<string, number[][]> | null = null,
    triggerOnRespins: boolean = false
  ) {
    super(container, responsePostProcessor, triggerOnRespins);
  }

  get hasRegistredExternalReelsFromName(): boolean {
    return true;
  }

  processReels(): void {
    if (!this.gameStateMachine.curResponse?.freeSpinsInfo) {
      return;
    }
    const name = this.gameStateMachine.curResponse.freeSpinsInfo.name;
    const namedConfig = this.gameConfig.getNamedConfig(name);
    if (!namedConfig) {
      if (
        this.gameStateMachine.curResponse.isFreeSpins &&
        this.gameStateMachine.curResponse.freeSpinsInfo.event !=
          FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        this.iconEnumerator.setSpinedReels(this.gameConfig.freeSpinConfig.spinedReels);
        return;
      }

      if (this.gameConfig.regularSpinConfig && this.gameConfig.regularSpinConfig.spinedReels) {
        this.iconEnumerator.setSpinedReels(this.gameConfig.regularSpinConfig.spinedReels);
        return;
      }
      this.iconEnumerator.setSpinedReels(this.gameConfig.staticConfig.spinedReels);
      return;
    }
    this.iconEnumerator.setSpinedReels(namedConfig.spinedReels);
  }
}
