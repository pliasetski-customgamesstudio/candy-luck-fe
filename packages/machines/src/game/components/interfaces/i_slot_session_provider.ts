import { IDisposable } from '@cgs/syd';
import { SlotSession } from '../../common/slot_session';

export abstract class ISlotSessionProvider implements IDisposable {
  abstract dispose(): void;
  abstract get slotSession(): SlotSession;
}
