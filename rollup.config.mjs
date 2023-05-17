import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import esbuild from "rollup-plugin-esbuild";
import path from "path";

export const plugins = ["GlobalBadges", "ReplaceTimestamps"];
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
            plugins: [
                alias({
                    entries: [
                        { find: "@common", replacement: path.resolve(__dirname, "common") },
                        { find: "@GlobalBadges", replacement: path.resolve(__dirname, "GlobalBadges") },
                        { find: "@ReplaceTimestamps", replacement: path.resolve(__dirname, "ReplaceTimestamps") },
                    ]
                }),
                nodeResolve(),
                commonjs(),
                json(),
                esbuild({
                    minify: true,
                    target: "ES2019",
                    tsconfig: "tsconfig.json"
                })
            ]
        });
    });
    return pluginConfigs;
};