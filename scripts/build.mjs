import { execSync } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const validPlugins = ["GlobalBadges", "ReplaceTimestamps", "SuppressEmbeds"];

const args = process.argv.slice(2);
let plugins = Array.from(new Set(args.map(arg => {
    const rootDir = arg.split("/")[0];
    return validPlugins.find(plugin => plugin === rootDir);
}))).filter(p => p);

const fetchLatestCommitHash = async () => {
    const repoApiUrl = "https://api.github.com/repos/HypedDomi/Enmity-Stuff/commits";
    try {
        const response = await fetch(repoApiUrl);
        const commits = await response.json();
        const latestCommitHash = commits[0].sha;
        return latestCommitHash;
    } catch (error) {
        console.error("Error fetching the latest commit hash:", error);
        return null;
    }
};

const updateManifests = async () => {
    plugins = plugins.length ? plugins : validPlugins;
    for (const plugin of plugins) {
        const pluginDir = join(__dirname, "..", plugin);
        const manifestPath = join(pluginDir, "manifest.json");

        try {
            const manifestContent = await readFile(manifestPath, "utf8");
            const manifest = JSON.parse(manifestContent);
            const latestCommitHash = await fetchLatestCommitHash();
            if (latestCommitHash) {
                manifest.hash = latestCommitHash;
                await writeFile(manifestPath, JSON.stringify(manifest, null, 4));
            } else console.warn(`Unable to update ${plugin} manifest.json as the latest commit hash is not available.`);
        } catch (error) {
            console.error(`Error updating ${plugin} manifest.json:`, error);
        }
    }
};

const updateRollupConfig = async rollupConfigPath => {
    plugins = plugins.length ? plugins : validPlugins;
    try {
        const rollupConfigContent = await readFile(rollupConfigPath, "utf8");

        const updatedRollupConfigContent = rollupConfigContent.replace(
            /const plugins = \[.*\]/g,
            `const plugins = ${JSON.stringify(plugins)}`
        ).replace(
            /alias\({([\s\S]*?)\}\)/g,
            `alias({
          entries: [
            { find: "@common", replacement: path.resolve(__dirname, "common") },
            ${plugins.map(plugin => `{ find: "@${plugin}", replacement: path.resolve(__dirname, "${plugin}") }`).join(",\n")}
          ]
        })`);
        await writeFile(rollupConfigPath, updatedRollupConfigContent);
        return rollupConfigContent;
    } catch (error) {
        console.error(`Error updating ${basename(rollupConfigPath)}:`, error);
    }
};

(async () => {
    const devBuild = !args.length;
    const isManualBuild = args.includes("--workflow_dispatch");
    if (!devBuild && !plugins.length && !isManualBuild) return console.log("No plugins to build");
    console.log(`Building ${devBuild ? "Development" : "Production"} Build`);

    // Update Hash of modified Plugins
    if (plugins.length || isManualBuild) await updateManifests();

    const rollupConfigPath = join(__dirname, "..", "rollup.config.js");
    const oldConfig = await updateRollupConfig(rollupConfigPath);
    console.log(`Building ${plugins.join(", ")}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    execSync("npx rollup -c --configPlugin esbuild", { stdio: "inherit" });
    if (devBuild) await writeFile(rollupConfigPath, oldConfig);
})();
