import { InternalRespinSpecGroup } from '@cgs/common';
import { Container } from '@cgs/syd';
import { ResponseDependentGameComponentProvider } from './response_dependent_game_component_provider';

export class RespinResponseDependentGameComponentProvider extends ResponseDependentGameComponentProvider {
  constructor(container: Container) {
    super(container);
  }

  get respinResponse(): InternalRespinSpecGroup {
    return this.currentResponse.additionalData as InternalRespinSpecGroup;
  }
}
