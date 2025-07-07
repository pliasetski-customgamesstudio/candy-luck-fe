import { Random } from './Random';
import { EmotionParticle } from './184_EmotionParticle';
import { EmotionParticleSystemParams } from './122_EmotionParticleSystemParams';
import { Matrix3 } from './57_Matrix3';
import { SpriteBatch } from './248_SpriteBatch';
import { Vector2 } from './15_Vector2';
import { SpriteData } from './162_SpriteData';
import { clamp, toRadians } from './globalFunctions';
import { Log } from './81_Log';
import { TemplateApplication } from './287_TemplateApplication';

export class EmotionParticleSystem {
  private static _Random = new Random();
  private static _Pool: EmotionParticle[] = [];

  private _params: EmotionParticleSystemParams;

  private _particles: EmotionParticle[];
  private _particlesCount: number = 0;
  private _maxCount: number = 0;

  private _elapsedTime: number;
  private _emitTime: number;

  private _totalParticlesSpawned: number = 0;

  constructor(params: EmotionParticleSystemParams) {
    this._params = params;
  }

  start(): void {
    this._particlesCount = 0;
    this._elapsedTime = 0.0;
    this._emitTime = 0.0;
  }

  stop(): void {}

  clear(): void {
    this._particlesCount = 0;
  }

  emit(dt: number, transform: Matrix3): void {
    const mc = this._params.maxCount;
    if (this._maxCount !== mc) {
      if (this._maxCount < mc) {
        const particles = new Array<EmotionParticle>(mc);
        for (let i = 0; i < this._particlesCount; ++i) {
          particles[i] = this._particles[i];
        }
        this._particles = particles;
        this._maxCount = mc;
      }
    }

    if (this._elapsedTime < this._params.duration || this._params.duration < 0.0) {
      this._emitTime += dt;

      const rate = this._params.emissionRate;
      const maxCount = this._maxCount;

      while (this._emitTime >= rate && this._particlesCount < maxCount) {
        this._emitTime -= rate;
        const p = this._spawn(transform);
        if (this.simulateParticle(p, this._emitTime)) {
          this._particles[this._particlesCount++] = p;
        }
      }

      if (this._emitTime > rate) {
        this._emitTime %= rate;
      }
    }
  }

  update(dt: number): void {
    this._elapsedTime += dt;

    let particlesCount = this._particlesCount;

    for (let i = 0; i < particlesCount; ++i) {
      const p = this._particles[i];
      if (!this.simulateParticle(p, dt)) {
        if (i !== particlesCount - 1) {
          EmotionParticleSystem._Pool.push(this._particles[i]);
          this._particles[i] = this._particles[particlesCount - 1];
        }
        --particlesCount;
        --i;
      }
    }

    this._particlesCount = particlesCount;
  }

  simulateParticle(p: EmotionParticle, dt: number): boolean {
    p.lifeTime -= dt;

    if (p.lifeTime > 0.0) {
      const time = dt < p.lifeTime ? dt : p.lifeTime;

      let radial = p.position.normalized();

      const tangentialX = radial.y * p.tangentialAccel;
      const tangentialY = -radial.x * p.tangentialAccel;

      radial = radial.mulNum(p.radialAccel);

      radial.x += tangentialX;
      radial.y += tangentialY;

      radial = radial.add(this._params.gravity);
      radial = radial.mulNum(time);

      p.direction = p.direction.add(radial);

      p.position.x += p.direction.x * time;
      p.position.y += p.direction.y * time;

      p.color.r += p.deltaColor.r * time;
      p.color.g += p.deltaColor.g * time;
      p.color.b += p.deltaColor.b * time;
      p.color.a += p.deltaColor.a * time;

      p.rotate += p.deltaRotate * time;

      p.size.x += p.deltaSize.x * time;
      p.size.y += p.deltaSize.y * time;

      p.frame += p.frameSpeed * time;

      return true;
    }

    return false;
  }

  draw(spriteBatch: SpriteBatch, _scale: Vector2, spriteData: SpriteData): void {
    spriteBatch.beginQuads(spriteData.texture!);

    const cnt = this._particlesCount;
    for (let i = 0; i < cnt; ++i) {
      const p = this._particles[i];

      let frameIndex = Math.trunc(p.frame) % spriteData.frames.length;
      if (frameIndex < 0) {
        frameIndex = Math.abs(frameIndex);
      }

      const frame = spriteData.frames[frameIndex];

      const pos = p.position.add(p.emitPosition);

      const sfx = frame.inverseWidth * p.size.x;
      const sfy = frame.inverseHeight * p.size.y;

      const x1 = frame.offset.x * sfx - p.size.x * 0.5;
      const y1 = frame.offset.y * sfy - p.size.y * 0.5;
      const x2 = x1 + frame.srcRect.width * sfx;
      const y2 = y1 + frame.srcRect.height * sfy;

      const color = p.color.clone();
      color.a *= this._params.sceneAlpha;

      if (spriteBatch.getRenderTarget()) {
        // Particles inside render target are correctly scaled with the target texture
        spriteBatch.drawQuad(
          frame.srcRect,
          x1,
          y1,
          x2,
          y2,
          pos,
          Vector2.One,
          toRadians(p.rotate),
          color
        );
      } else {
        // Use drawQuadWithExtraScale with Vector2.One for main scale and TemplateApplication.scale
        // for the adjustment by coordinate system / viewport mismatch
        spriteBatch.drawQuadWithExtraScale(
          frame.srcRect,
          x1,
          y1,
          x2,
          y2,
          pos,
          Vector2.One,
          TemplateApplication.scale,
          toRadians(p.rotate),
          color
        );
      }
    }

    spriteBatch.endQuads();
  }

  private _spawn(transform: Matrix3): EmotionParticle {
    const params = this._params;
    const random = EmotionParticleSystem._Random;

    const result =
      EmotionParticleSystem._Pool.length > 0
        ? EmotionParticleSystem._Pool.pop()!
        : new EmotionParticle();
    this._totalParticlesSpawned++;

    result.lifeTime = params.lifeTime + params.lifeTimeVariance * random.nextDouble();
    const inverseLifeTime = 1.0 / result.lifeTime;

    let vx = random.nextDouble() * 2.0 - 1.0;
    let vy = random.nextDouble() * 2.0 - 1.0;

    result.emitPosition.x = transform.tx;
    result.emitPosition.y = transform.ty;

    result.position.x = params.positionVariance.x * vx + params.emitterPosition.x;
    result.position.y = params.positionVariance.y * vy + params.emitterPosition.y;

    transform.rotateVectorInplace(result.position);

    vx = 1.0 - random.nextDouble() * 2.0;
    const rad = toRadians(params.angle + params.angleVariance * vx);

    vx = 1.0 - random.nextDouble() * 2.0;
    const speed = params.speed + params.speedVariance * vx;

    result.direction.x = Math.cos(rad) * speed;
    result.direction.y = Math.sin(rad) * speed;
    transform.rotateVectorInplace(result.direction);

    vx = 1.0 - random.nextDouble() * 2.0;
    result.radialAccel = params.radialAccel + params.radialAccelVariance * vx;

    vx = 1.0 - random.nextDouble() * 2.0;
    result.tangentialAccel = params.tangentialAccel + params.tangentialAccelVariance * vx;

    vx = 1.0 - random.nextDouble() * 2.0;
    vy = 1.0 - random.nextDouble() * 2.0;

    const startSizeX = params.startSize.x + params.startSizeVariance.x * vx;
    const startSizeY = params.startSize.y + params.startSizeVariance.y * vx;

    const endSizeX = params.endSize.x + params.endSizeVariance.x * vy;
    const endSizeY = params.endSize.y + params.endSizeVariance.y * vy;

    result.size.x = startSizeX;
    result.size.y = startSizeY;

    result.deltaSize.x = (endSizeX - startSizeX) * inverseLifeTime;
    result.deltaSize.y = (endSizeY - startSizeY) * inverseLifeTime;

    vx = 1.0 - random.nextDouble() * 2.0;
    vy = 1.0 - random.nextDouble() * 2.0;
    const startRotate = params.startRotate + params.startRotateVariance * vx;
    const endRotate = params.endRotate + params.endRotateVariance * vy;

    result.rotate = startRotate;
    result.deltaRotate = (endRotate - startRotate) * inverseLifeTime;

    vx = 1.0 - random.nextDouble() * 2.0;
    vy = 1.0 - random.nextDouble() * 2.0;
    result.frame = params.startFrame + params.startFrameVariance * vx;
    result.frameSpeed = params.frameSpeed + params.frameSpeedVariance * vy;

    const startColorR = clamp(
      params.startColor.r + params.startColorVariance.r * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );
    const startColorG = clamp(
      params.startColor.g + params.startColorVariance.g * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );
    const startColorB = clamp(
      params.startColor.b + params.startColorVariance.b * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );
    const startColorA = clamp(
      params.startColor.a + params.startColorVariance.a * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );

    const endColorR = clamp(
      params.endColor.r + params.endColorVariance.r * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );
    const endColorG = clamp(
      params.endColor.g + params.endColorVariance.g * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );
    const endColorB = clamp(
      params.endColor.b + params.endColorVariance.b * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );
    const endColorA = clamp(
      params.endColor.a + params.endColorVariance.a * (1.0 - random.nextDouble() * 2.0),
      0.0,
      1.0
    );

    result.color.r = startColorR;
    result.color.g = startColorG;
    result.color.b = startColorB;
    result.color.a = startColorA;

    result.deltaColor.r = (endColorR - startColorR) * inverseLifeTime;
    result.deltaColor.g = (endColorG - startColorG) * inverseLifeTime;
    result.deltaColor.b = (endColorB - startColorB) * inverseLifeTime;
    result.deltaColor.a = (endColorA - startColorA) * inverseLifeTime;

    return result;
  }

  debugPrint(): void {
    Log.Trace('[EmotionParticleSystem] particles spawned: ' + this._totalParticlesSpawned);
  }
}
