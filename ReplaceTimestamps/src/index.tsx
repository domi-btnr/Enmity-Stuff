import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { create } from "enmity/patcher";
import { Messages, React } from "enmity/metro/common";
import { get, set } from "enmity/api/settings";
import Settings from "./components/Settings";
import { hasUpdate, showUpdateDialog, showChangelog } from "./pluginUpdater";
import manifest from "../manifest.json";

const Patcher = create("ReplaceTimestamps");
const ReplaceTimestamps: Plugin = {
    ...manifest,
    onStart() {
        if (!get(manifest.name, "_didUpdate", false)) {
            if (get(manifest.name, "autoUpdateCheck", true)) {
                hasUpdate().then((b) => {
                    if (b) showUpdateDialog();
                });
            }
            if (get(manifest.name, "_changelog", manifest.version) !== manifest.version) showChangelog();
        }
        set(manifest.name, "_didUpdate", false);

        const getUnixTimestamp = (time) => {
            const date = new Date()
                .toISOString()
                .replace(/T/, " ")
                .replace(/\..+/, "")
                .replace(/\d?\d:\d\d/, time);
            const then = Math.round(new Date(date).getTime() / 1000);
            if (isNaN(then)) return time;
            return ` <t:${then}:t> `;
        };

        Patcher.before(Messages, "sendMessage", (_, [, msg]) => {
            let REGEX =
                /(?:^| )(?:([0-2]?[1-9]):([0-5][0-9])(?: ?([ap]m{1}?))?|([0-2]?[1-9])(?: ?([ap]m{1}?)))(?:$| )/gim; /* Thank you King Fish */
            if (msg.content.search(REGEX) !== -1)
                msg.content = msg.content.replace(REGEX, (x) => {
                    REGEX =
                        /(?:^| )(?:([0-2]?[1-9]):([0-5][0-9])(?: ?([ap]m?))?|([0-2]?[1-9])(?: ?([ap]m?)))(?:$| )/gim; /* Reset REGEX */
                    let [, hours, minutes, mode, hours2, mode2] = REGEX.exec(x);
                    console.log(`[ReplaceTimestamps] ${hours}, ${minutes}, ${mode}, ${hours2}, ${mode2}`);
                    [hours, minutes] = [hours ? hours : hours2, minutes ? minutes : "00"].map((i) => parseInt(i));
                    let time = `${hours}:${minutes}`;
                    mode = mode ? mode : mode2;
                    if (mode && mode.toLowerCase() === "pm" && hours < 12 && hours !== 0) {
                        hours += 12;
                        minutes = minutes.toString().padStart(2, "0");
                        time = `${hours}:${minutes}`;
                    } else if ((mode && mode.toLowerCase() === "am" && hours === 12) || hours === 24)
                        time = `00:${minutes}`;
                    return getUnixTimestamp(time);
                });
        });
    },

    onStop() {
        Patcher.unpatchAll();
    },

    getSettingsPanel({ settings }) {
        return <Settings settings={settings} />;
    },
};

registerPlugin(ReplaceTimestamps);
