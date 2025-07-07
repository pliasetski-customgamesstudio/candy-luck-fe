interface IShopConfigItemDTO {
  count: number;
  credits: number;
  type: ShopConfigItemType;
}

export const enum ShopConfigItemType {
  Gem = 'Gem',
  Ads = 'Ads',
}

export class ShopConfigItemDTO implements IShopConfigItemDTO {
  count: number;
  credits: number;
  type: ShopConfigItemType;

  constructor(count: number, credits: number, type: ShopConfigItemType) {
    this.count = count;
    this.credits = credits;
    this.type = type;
  }

  static fromJson(json: IShopConfigItemDTO): ShopConfigItemDTO {
    return new ShopConfigItemDTO(json.count, json.credits, json.type);
  }
}
