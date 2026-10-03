/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// `@uai/*` points at the distributed registry source so videos render the real
// components. Their imports resolve from this package's node_modules, which keeps
// a single copy of React in the bundle.
Config.overrideBundlerConfig((config) => {
  const withTailwind = enableTailwind(config);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias as Record<string, string>),
        "@uai": path.resolve(process.cwd(), "../src/registry/uai"),
      },
      modules: [path.resolve(process.cwd(), "node_modules"), "node_modules"],
    },
  };
});
