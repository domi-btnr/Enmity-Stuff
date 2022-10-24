import { Plugin, registerPlugin } from "enmity/managers/plugins";
import manifest from "../manifest.json";

const PluginTemplate: Plugin = {
    ...manifest,
    onStart() {},
    onStop() {},
};

registerPlugin(PluginTemplate);
