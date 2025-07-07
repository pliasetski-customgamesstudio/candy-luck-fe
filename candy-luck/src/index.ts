import '../styles/main.css';
import { PlatformSettings, Preloader, ResizeMode, Main } from '@cgs/syd';
import { CoordinateSystemInfoProvider } from '@cgs/common';
import { CustomGamesGame } from '@cgs/lobby';
import {
  Logger,
  EnvironmentConfig,
  ApplicationGameConfig,
  ApplicationUserConfig,
} from '@cgs/shared';

function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        (error) => {
          console.log('ServiceWorker registration failed: ', error);
        }
      );
    });
  }
}

function initAppSettings(): void {
  const gameId = 'game2';
  const machineId = '1';

  if (ENVIRONMENT_CONFIG) {
    EnvironmentConfig.init(ENVIRONMENT_CONFIG);
  } else {
    throw new Error('ENVIRONMENT_CONFIG global variable is missing!');
  }

  ApplicationGameConfig.init({
    currency: 'USD',
    gameId: gameId || '',
    machineId: machineId || undefined,
  });

  ApplicationUserConfig.init();
}

window.onload = async () => {
  const canvas = document.querySelector('#drawHere') as HTMLCanvasElement;

  if (!canvas) {
    throw new Error('Cannot find root canvas element!');
  }

  Logger.Initialize();
  Logger.Debug('Logger initialized');

  const settings = new PlatformSettings(false, false, false, ResizeMode.ProportionalScale);
  settings.preloader = new Preloader(canvas, '#splashContainer');

  initAppSettings();

  Main.Run(
    window,
    canvas,
    (platform, resourceCache) =>
      new CustomGamesGame(platform, resourceCache, new CoordinateSystemInfoProvider(platform)),
    settings
  );

  registerServiceWorker();
};
