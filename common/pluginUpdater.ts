import { reload } from "enmity/api/native";
import { get, set } from "enmity/api/settings";
import { Dialog } from "enmity/metro/common";

const PluginUpdater = {
    name: "",
    version: "",
    rawUrl: "",
    changelog: [""],
    hash: "",

    remoteHash: null,
    remoteVersion: null,
    remoteChangelog: [""],

    create({
        name,
        version,
        rawUrl,
        changelog,
        hash
    }) {
        if (!name || !version || !rawUrl || !changelog || !hash)
            return console.error(`[${name || __filename}] Missing parameters in constructor`);
        this.name = name;
        this.version = version;
        this.rawUrl = rawUrl;
        this.changelog = changelog;
        this.hash = hash;

        if (!get(name, "_didUpdate", false)) {
            if (get(name, "_changelog", version) !== version) this.showChangelog();
            if (get(name, "autoUpdateCheck", true)) this.checkForUpdates();
        }
        set(name, "_didUpdate", false);
    },

    showChangelog() {
        if (!this.changelog) return;
        Dialog.show({
            title: `${this.name} - v${this.version}`,
            body: `- ${this.changelog.join("\n- ")}`,
            confirmText: "OK",
            onConfirm: () => set(this.name, "_changelog", this.version),
        });
    },

    async checkForUpdates(showNoUpdateDialog = false) {
        const resp = await fetch(`${this.rawUrl}?${Math.random()}`);
        const content = await resp.text();

        const remoteHashVar = content.match(/hash:(\w+)/)?.[1];
        const rawRemoteHash = content.match(new RegExp(`${remoteHashVar}="([^,"]+)"`))?.[1];
        if (!rawRemoteHash) console.warn(`[${this.name}] Failed to fetch remote hash`);
        else this.remoteHash = rawRemoteHash ?? "0AB1C2";

        const remoteVersionVar = content.match(/version:(\w+)/)?.[1];
        const rawRemoteVersion = content.match(new RegExp(`${remoteVersionVar}="([^,"]+)"`))?.[1];
        if (!rawRemoteVersion) console.warn(`[${this.name}] Failed to fetch remote version`);
        else this.remoteVersion = rawRemoteVersion;

        const remoteChangelogVar = content.match(/changelog:(\w+)/)?.[1];
        const rawRemoteChangelog = content.match(new RegExp(`${remoteChangelogVar}=\\[(.*?)\\]`))?.[0];
        if (!rawRemoteChangelog) console.warn(`[${this.name}] Failed to fetch remote changelog`);
        else this.remoteChangelog = JSON.parse(rawRemoteChangelog.replace(`${remoteChangelogVar}=`, ""));

        if (this.remoteHash && this.remoteVersion) {
            const currentVersionParts = this.version.split(".").map(Number);
            const remoteVersionParts = this.remoteVersion.split(".").map(Number);

            for (let i = 0; i < currentVersionParts.length; i++) {
                if (remoteVersionParts[i] > currentVersionParts[i])
                    return this.showUpdateDialog({ version: this.remoteVersion, changelog: this.remoteChangelog });
                else if (remoteVersionParts[i] < currentVersionParts[i]) return console.log(`[${this.name}] Remote version is older than local version`);
            }

            if (this.remoteHash !== this.hash) return this.showUpdateDialog({ hash: this.remoteHash });
        }

        if (!showNoUpdateDialog) return;
        Dialog.show({
            title: "Plugin Updater",
            body: `No update available for ${this.name}`,
            confirmText: "OK",
        });
    },

    showUpdateDialog({ version, hash, changelog }: { version?: string, hash?: string, changelog?: string[] }) {
        if (!version && !hash) return console.error(`[${this.name}] Missing parameters in showUpdateDialog()`);

        let updateMSG = "";
        if (version) updateMSG = `New Version for ${this.name} is available!`;
        else updateMSG = `New Build for ${this.name} is available!`;
        updateMSG += "\nWould you like to update now?";
        if (changelog) updateMSG += `\n\nChangelog:\n- ${changelog.join("\n- ")}`;

        Dialog.show({
            title: "Plugin Updater",
            body: updateMSG,
            confirmText: "Update",
            cancelText: "No",
            onConfirm: () => {
                set(this.name, "_didUpdate", true);
                this.installPlugin(!!hash);
            },
        });
    },

    installPlugin(hash = false) {
        const updateType = hash ? "updated Build" : "updated Version";
        const versionText = hash ? `\`${this.remoteHash?.slice(0, 7)}\`` : this.remoteVersion;

        // @ts-ignore
        window.enmity.plugins.installPlugin(`${this.rawUrl}?${Math.random()}`, ({ data }) => {
            if (data === "installed_plugin" || data === "overridden_plugin") {
                Dialog.show({
                    title: `Installed ${this.name} v${this.remoteVersion}`,
                    body: `Successfully ${updateType} to **${versionText}**.\nWould you like to reload Discord now?`,
                    confirmText: "Reload",
                    cancelText: "Later",
                    onConfirm: reload,
                });
            } else console.error(`[${this.name}] Failed to install v${versionText}`);
        });
    },
};

export default PluginUpdater;
