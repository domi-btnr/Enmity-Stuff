import { name, rawUrl, version } from "../manifest.json";
import { Dialog } from "enmity/metro/common";
import { reload } from "enmity/api/native";

export async function hasUpdate(): Promise<Boolean> {
    const resp = await fetch(`${rawUrl}?${Math.random()}`);
    const content = await resp.text();
    let remoteVersion = content.match(/[0-9].[0-9].[0-9]/g);
    if (!remoteVersion) return false;
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
    //@ts-ignore
    window.enmity.plugins.installPlugin(url).then(() => {
        Dialog.show({
            title: "Plugin Updater",
            body: "Updated to the latest version. Would you like to reload Discord now?",
            confirmText: "Reload",
            cancelText: "Later",
            onConfirm: reload,
        });
    });
};

export function showUpdateDialog(): void {
    Dialog.show({
        title: "Plugin Updater",
        body: `${name} has an update. Do you want to update now?`,
        confirmText: "Update",
        cancelText: "No",
        onConfirm: installPlugin(`${rawUrl}?${Math.random()}`),
    });
}
