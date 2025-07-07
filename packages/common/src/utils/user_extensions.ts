import { SimpleUserDTO } from '@cgs/network';

export class UserExtensions {
  static safeDisplayName(_user: SimpleUserDTO): string {
    return 'THIS IS A MOCK USER NAME';
    // return !user.displayName || user.displayName.isEmpty ? user.name : user.displayName;
  }
}
