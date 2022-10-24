import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";

const plugins = ["ReplaceTimestamps"];
export default () => {
    const pluginConfigs = plugins.map((pluginName) => {
        return defineConfig({
            input: `${pluginName}/src/index.tsx`,
            output: [
                {
                    file: `dist/${pluginName}.js`,
                    format: "cjs",
                    strict: false,
                },
            ],
            plugins: [nodeResolve(), commonjs(), json(), esbuild({ minify: true, target: "ES2019" })],
        });
    });
    return pluginConfigs;
};
