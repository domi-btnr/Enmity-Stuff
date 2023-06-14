import manifest from "@PluginTemplate/manifest.json";
import { Plugin, registerPlugin } from "enmity/managers/plugins";

const PluginTemplate: Plugin = {
    ...manifest,
    onStart() {},
    onStop() {},
};

registerPlugin(PluginTemplate);
