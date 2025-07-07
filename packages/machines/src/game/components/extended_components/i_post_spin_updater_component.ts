import { ISpinResponse } from '@cgs/common';

export interface IPostSpinUpdaterComponent {
  processResponse(response: ISpinResponse): void;
}
