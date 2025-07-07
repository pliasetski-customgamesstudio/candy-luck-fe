export class Volatility {
  id: number | null;
  name: string | null;

  constructor({ id, name }: { id: number | null; name: string | null }) {
    this.id = id;
    this.name = name;
  }

  static fromJson(json: { [key: string]: any }): Volatility {
    return new Volatility({
      id: json['id'] ?? null,
      name: json['name'] ?? null,
    });
  }
}
