import { MovingPositionDTO } from './MovingPositionDTO';

export class MovingSymbolsDTO {
  current: MovingPositionDTO[] | null;
  next: MovingPositionDTO[] | null;

  constructor(current: MovingPositionDTO[] | null, next: MovingPositionDTO[] | null) {
    this.current = current;
    this.next = next;
  }

  static fromJson(json: Record<string, any>): MovingSymbolsDTO {
    return new MovingSymbolsDTO(
      json['current'] ? json['current'].map((x: any) => MovingPositionDTO.fromJson(x)) : null,
      json['next'] ? json['next'].map((x: any) => MovingPositionDTO.fromJson(x)) : null
    );
  }
}
