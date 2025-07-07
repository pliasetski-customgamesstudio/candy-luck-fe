import { CgsEvent } from '@cgs/syd';

export class GambleEvent extends CgsEvent {
  success: boolean;

  constructor(isSuccess: boolean) {
    super();
    this.success = isSuccess;
  }
}
