export enum Effect {
  Texture0 = 1 << 1,
  Color = 1 << 2,
  Mask1 = 1 << 3,
  PremultAlpha = 1 << 4,
  ColorOffset = 1 << 5,
  Saturation = 1 << 6,
  Contrast = 1 << 7,
  Brightness = 1 << 8,
  Hue = 1 << 9,
  Video = 1 << 10,
  Transform = 1 << 11,
  Mask2 = 1 << 12,
  ColorAdjust = Hue | Brightness | Saturation | Contrast,
}

export function HasEffect(effect: number): boolean {
  return (
    (effect &
      (Effect.ColorAdjust |
        Effect.Mask1 |
        Effect.Mask2 |
        Effect.Texture0 |
        Effect.Video |
        Effect.Transform |
        Effect.Color |
        Effect.PremultAlpha |
        Effect.ColorOffset |
        Effect.Hue |
        Effect.Brightness |
        Effect.Saturation |
        Effect.Contrast)) !==
    0
  );
}
