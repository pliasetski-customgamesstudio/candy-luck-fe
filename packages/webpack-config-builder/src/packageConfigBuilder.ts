import type { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { BuildMode, PackageBuilderOptions } from './configBuilder.types';

export function packageConfigBuilder(options: PackageBuilderOptions): Configuration {
  const isDev = options.mode === BuildMode.Dev;

  return {
    mode: isDev ? 'development' : 'production',
    entry: options.entryFile,
    devtool: isDev ? 'inline-source-map' : undefined,
    output: {
      path: options.outputFolder,
      filename: 'bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(xml)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
        {
          test: /\.(zip)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      options.copyFiles ? new CopyWebpackPlugin({ patterns: options.copyFiles }) : undefined,
    ],
    performance: !isDev
      ? {
          hints: false,
          maxEntrypointSize: 1024000,
          maxAssetSize: 1024000,
        }
      : false,
  };
}
