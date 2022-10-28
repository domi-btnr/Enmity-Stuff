// @ts-nocheck

import { changelog, name, rawUrl, version } from "../manifest.json";
import { Dialog } from "enmity/metro/common";
import { reload } from "enmity/api/native";
import { set } from "enmity/api/settings";

export async function hasUpdate(): Promise<Boolean> {
    const resp = await fetch(`${rawUrl}?${Math.random()}`);
    const content = await resp.text();
    let remoteVersion = content.match(/[0-9].[0-9].[0-9]/g);
    if (!remoteVersion?.length) return false;
    remoteVersion = remoteVersion[0].replace('"', "");
    remoteVersion = remoteVersion.split(".").map((e) => {
        return parseInt(e);
    });
    const currentVersion = version.split(".").map((e) => {
        return parseInt(e);
    });
    if (remoteVersion[0] > currentVersion[0]) return true;
    else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] > currentVersion[1]) return true;
    else if (
        remoteVersion[0] == currentVersion[0] &&
        remoteVersion[1] == currentVersion[1] &&
        remoteVersion[2] > currentVersion[2]
    )
        return true;
    return false;
}

const installPlugin = (url: string) => {
    window.enmity.plugins.installPlugin(url);
    Dialog.show({
        title: "Plugin Updater",
        body: "Updated to the latest version. Would you like to reload Discord now?",
        confirmText: "Reload",
        cancelText: "Later",
        onConfirm: () => reload(),
    });
};

export function showUpdateDialog(): void {
    Dialog.show({
        title: "Plugin Updater",
        body: `**${name}** has an update. Do you want to update now?`,
        confirmText: "Update",
        cancelText: "No",
        onConfirm: () => {
            set(name, "_didUpdate", true);
            set(name, "_changelog", false);
            installPlugin(`${rawUrl}?${Math.random()}`);
        },
    });
}

export function showChangelog(): void {
    Dialog.show({
        title: `${name} - v${version}`,
        body: `- ${changelog.join("\n- ")}`,
        confirmText: "OK",
        onConfirm: () => set(name, "_changelog", true),
    });
}
