export function mergeMap(from: Record<string, any>, to: Record<string, any>): void {
  Object.keys(from).forEach((key) => {
    if (to[key] instanceof Object && from[key] instanceof Object) {
      mergeMap(from[key], to[key]);
    } else {
      to[key] = from[key];
    }
  });
  // from.forEach((value, key) => {
  //   if (to.has(key) && to.get(key) instanceof Map && from.get(key) instanceof Map) {
  //     mergeMap(from.get(key), to.get(key));
  //   } else {
  //     to.set(key, value);
  //   }
  // });
}

export function mergeNamedConfigs(from: Map<string, any>, to: Map<string, any>): void {
  for (const key of from.keys()) {
    const freeSpinsNameConfig = from.get(key) as Map<string, any>;
    if (!freeSpinsNameConfig) {
      continue;
    }
    mergeNamedConfigsReversed(freeSpinsNameConfig, to);
  }
}

export function mergeNamedConfigsReversed(
  freeSpins: Map<string, any>,
  defaultConfig: Map<string, any>
): void {
  for (const key of defaultConfig.keys()) {
    if (
      freeSpins.has(key) &&
      defaultConfig.get(key) instanceof Map &&
      freeSpins.get(key) instanceof Map
    ) {
      mergeNamedConfigsReversed(
        freeSpins.get(key) as Map<string, any>,
        defaultConfig.get(key) as Map<string, any>
      );
    } else {
      if (!freeSpins.has(key) && !(defaultConfig.get(key) instanceof Map)) {
        freeSpins.set(key, defaultConfig.get(key));
      }
    }
  }
}
