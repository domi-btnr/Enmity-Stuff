import manifest from "@ReplaceTimestamps/manifest.json";
import { get } from "enmity/api/settings";
import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { Messages, React } from "enmity/metro/common";
import { create } from "enmity/patcher";

import Settings from "./components/Settings";
import { getRelativeTime, getUnixTimestamp } from "./modules/utils";

const Patcher = create(manifest.name);
const ReplaceTimestamps: Plugin = {
    ...manifest,
    onStart() {
        Patcher.before(Messages, "sendMessage", (_, [, msg]) => {
            const timeRegex = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
            const timeRegexMatch = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;

            const dateFormat = (get(manifest.name, "dateFormat", "dd.MM.yyyy") as string).replace(/[./]/g, "[./]").replace("dd", "(\\d{2})").replace("MM", "(\\d{2})").replace("yyyy", "(\\d{4})");
            const dateRegex = new RegExp(`${dateFormat}`, "gi");
            const dateRegexMatch = new RegExp(`${dateFormat}`, "i");

            const TimeDateRegex = new RegExp(`(${timeRegex.source})\\s+${dateRegex.source}`, "gi");
            const DateRegexTime = new RegExp(`${dateRegex.source}\\s+(${timeRegex.source})`, "gi");

            const relativeRegex = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/gi;
            const relativeRegexMatch = /\b(?:in\s+(\d+)([smhdw]|mo|y)|(\d+)([smhdw]|mo|y)\s+ago)\b/i;

            if (msg.content.search(TimeDateRegex) !== -1) {
                msg.content = msg.content.replace(TimeDateRegex, (str: string) => getUnixTimestamp({ str, dateRegexMatch, timeRegexMatch }));
            }
            if (msg.content.search(DateRegexTime) !== -1) {
                msg.content = msg.content.replace(DateRegexTime, (str: string) => getUnixTimestamp({ str, dateRegexMatch, timeRegexMatch }));
            }
            if (msg.content.search(timeRegex) !== -1) {
                msg.content = msg.content.replace(timeRegex, (str: string) => getUnixTimestamp({ str, format: "t", dateRegexMatch, timeRegexMatch }));
            }
            if (msg.content.search(dateRegex) !== -1) {
                msg.content = msg.content.replace(dateRegex, (str: string) => getUnixTimestamp({ str, format: "d", dateRegexMatch, timeRegexMatch }));
            }
            if (msg.content.search(relativeRegex) !== -1) {
                msg.content = msg.content.replace(relativeRegex, (str: string) => getRelativeTime({ str, relativeRegexMatch }));
            }
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
