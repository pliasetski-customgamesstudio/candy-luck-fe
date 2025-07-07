import path from 'path';
import { Configuration } from 'webpack';
import { BuildMode, packageConfigBuilder, EnvironmentOptions } from '@cgs/webpack-config-builder';

export default (env: EnvironmentOptions): Configuration => {
  return packageConfigBuilder({
    ...env,
    mode: env.mode || BuildMode.Dev,
    entryFile: path.resolve(__dirname, 'src', 'index.ts'),
    outputFolder: path.resolve(__dirname, 'dist'),
  });
};
