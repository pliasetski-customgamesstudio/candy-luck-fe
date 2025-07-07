export class BaseSpecGroupDTO {
  type: string | null;

  constructor({ type }: { type: string | null }) {
    this.type = type;
  }

  static fromJson(json: Record<string, any>): BaseSpecGroupDTO {
    return new BaseSpecGroupDTO({
      type: json['type'] ?? null,
    });
  }
}
