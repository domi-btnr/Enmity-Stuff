import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { Messages, React } from "enmity/metro/common";
import { create } from "enmity/patcher";

import manifest from "@ReplaceTimestamps/manifest.json";
import Settings from "./components/Settings";

const Patcher = create(manifest.name);
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
            return ` <t:${then}:t> `;
        };

        Patcher.before(Messages, "sendMessage", (_, [, msg]) => {
            const REGEX = /\b(0?[0-9]|1[0-9]|2[0-4]):([0-5][0-9])( ?[ap]m)?\b/gi;
            if (msg.content.search(REGEX) !== -1)
                msg.content = msg.content.replace(REGEX, (x: string) => {
                    let hours: number, minutes: string, mode: null | "AM" | "PM";
                    // @ts-ignore
                    [, hours, minutes, mode] = REGEX.exec(x).map((g, i) => {
                        if (g === undefined) return g;
                        if (i === 1 || i === 2) return parseInt(g);
                        if (i === 3) return g.toUpperCase();
                    });
                    let time = `${hours}:${minutes}`;
                    if (mode === "PM" && hours < 12 && hours !== 0) {
                        hours += 12;
                        minutes = minutes.toString().padStart(2, "0");
                        time = `${hours}:${minutes}`;
                    } else if ((mode === "AM" && hours === 12) || hours === 24) {
                        time = `00:${minutes}`;
                    }
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
