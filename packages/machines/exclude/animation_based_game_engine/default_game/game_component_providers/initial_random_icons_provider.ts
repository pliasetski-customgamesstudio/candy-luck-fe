import { Random } from 'dart:math';
import { Container } from 'package:machines/machines.dart';
import { IconModelComponent } from 'package:syd/syd.dart';

export interface IInitialIconsProvider {
  getInitialIcons(iconsCount: number): number[];
}

class InitialRandomIconsProvider implements IInitialIconsProvider {
  private _random: Random;
  private _iconModel: IconModelComponent;
  private _allowRepeatedIcons: boolean;

  constructor(container: Container, allowRepeatedIcons: boolean) {
    this._random = new Random();
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._allowRepeatedIcons = allowRepeatedIcons;
  }

  getInitialIcons(iconsCount: number): number[] {
    return this._allowRepeatedIcons
      ? this.getIcons(iconsCount)
      : this.getNotRepeatedIcons(iconsCount);
  }

  private getIcons(iconsCount: number): number[] {
    const init: number[] = new Array(iconsCount);
    for (let i = 0; i < iconsCount; i++) {
      do {
        init[i] =
          this._iconModel.minStaticIconId +
          this._random.nextInt(this._iconModel.maxStaticIconId - this._iconModel.minStaticIconId);
      } while (!this._iconModel.hasStaticIcon(init[i]));
    }

    return init;
  }

  private getNotRepeatedIcons(iconsCount: number): number[] {
    const iconsList: number[] = [];
    for (let i = this._iconModel.minStaticIconId; i <= this._iconModel.maxStaticIconId; i++) {
      if (this._iconModel.hasStaticIcon(i)) {
        iconsList.push(i);
      }
    }

    iconsList.shuffle();

    return iconsList.slice(0, iconsCount);
  }
}
