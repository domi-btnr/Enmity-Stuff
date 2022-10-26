import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { create } from "enmity/patcher";
import { Messages, React } from "enmity/metro/common";
import Settings from "./components/Settings";
import manifest from "../manifest.json";

const Patcher = create("ReplaceTimestamps");
const ReplaceTimestamps: Plugin = {
    ...manifest,
    onStart() {
        const getUnixTimestamp = (time) => {
            const date = new Date()
                .toISOString()
                .replace(/T/, " ")
                .replace(/\..+/, "")
                .replace(/\d?\d:\d\d/, time);
            const then = Math.round(new Date(date).getTime() / 1000);
            if (isNaN(then)) return time;
            return `<t:${then}:t>`;
        };

        Patcher.before(Messages, "sendMessage", (_, [, msg]) => {
            const regexAGlobal = /(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi;
            const regexA = /((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;
            if (msg.content.search(regexAGlobal) !== -1)
                msg.content = msg.content.replace(regexAGlobal, (x) => {
                    let [, time, mode] = x.match(regexA);
                    let [hours, minutes] = time.split(":").map((e) => parseInt(e));
                    if (mode && mode.toLowerCase() === "pm" && hours < 12 && hours !== 0) {
                        hours += 12;
                        minutes = minutes.toString().padStart(2, "0");
                        time = `${hours}:${minutes}`;
                    } else if ((mode && mode.toLowerCase() === "am" && hours === 12) || hours === 24)
                        time = `00:${minutes}`;
                    else if (minutes >= 60) {
                        hours += Math.floor(minutes / 60);
                        minutes = minutes % 60;
                        time = `${hours}:${minutes}`;
                    }
                    return getUnixTimestamp(time);
                });
        });
    },

    onStop() {
        Patcher.unpatchAll();
    },

    getSettingsPanel() {
        return <Settings />;
    },
};

registerPlugin(ReplaceTimestamps);
