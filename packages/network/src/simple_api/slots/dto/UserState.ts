import { SimpleUserDTO } from '../../user/dto/dto';

export class UserState {
  userInfo: SimpleUserDTO;

  constructor(userInfo: SimpleUserDTO) {
    this.userInfo = userInfo;
  }

  static fromJson(json: { [key: string]: any }): UserState {
    return new UserState(SimpleUserDTO.fromJson(json['userInfo']));
  }
}
