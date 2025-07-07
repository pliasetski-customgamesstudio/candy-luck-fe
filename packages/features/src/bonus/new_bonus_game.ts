import { BonusGame } from './bonus_game';
import { NewBonusMessageResolver } from './resolvers/new_bonus_message_resolver';
import {
  BonusContext,
  CancellationToken,
  IBonusResponse,
  IBonusScene,
  IConfiguration,
} from '@cgs/common';
import { IMiniGameService } from './interfaces/i_bonus_game';
import { Func3 } from '@cgs/shared';

export class NewBonusGame extends BonusGame {
  constructor(
    bonusScene: IBonusScene,
    bonusService: IMiniGameService,
    configuration: IConfiguration,
    bonusContext: BonusContext,
    updateBonusFinishPropertiesWithCurrent: Func3<
      IBonusResponse,
      Map<string, any>,
      Map<string, any>,
      void
    > | null,
    gameType: string,
    cancellationToken: CancellationToken
  ) {
    super(
      bonusScene,
      bonusService,
      bonusContext,
      updateBonusFinishPropertiesWithCurrent,
      gameType,
      cancellationToken
    );
    this.bonusMessageResolver = new NewBonusMessageResolver(
      bonusContext,
      updateBonusFinishPropertiesWithCurrent,
      configuration
    );
  }
}
