import ActionRow from "@common/ActionRow.tsx";
import manifest from "@SuppressEmbeds/manifest.json";
import { getIDByName } from "enmity/api/assets";
import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { bulk, filters } from "enmity/metro";
import { Constants, Locale, React, REST, Users } from "enmity/metro/common";
import { create } from "enmity/patcher";
import { findInReactTree } from "enmity/utilities";

import Settings from "./components/Settings";

const EMBED_SUPPRESSED = 1 << 2;

const [
    ChannelStore,
    LazyActionSheet,
    PermissionStore
] = bulk(
    filters.byProps("getChannel"),
    filters.byProps("openLazy", "hideActionSheet"),
    filters.byProps("getChannelPermissions")
);

const Patcher = create(manifest.name);
const UnsuppressEmbeds: Plugin = {
    ...manifest,
    onStart() {
        Patcher.before(LazyActionSheet, "openLazy", (_, [component, key, msg]) => {
            const message = msg?.message;
            if (key !== "MessageLongPressActionSheet" || !message) return;
            component.then(instance => {
                const unpatch = Patcher.after(instance, "default", (_, __, res) => {
                    React.useEffect(() => () => { unpatch(); }, []);
                    const deleteButtonGroup = findInReactTree(res, x => {
                        if (Array.isArray(x) && x.length > 0) {
                            return x.some(item => item?.type?.name === "ButtonRow" && item?.props?.label === Locale.Messages.DELETE_MESSAGE);
                        }
                        return false;
                    });
                    if (!deleteButtonGroup) return res;

                    const channel = ChannelStore.getChannel(message.channel_id);
                    const isEmbedSuppressed = !!(message.flags & EMBED_SUPPRESSED);
                    const hasEmbedPerms = !!(PermissionStore.getChannelPermissions({ id: message.channel_id }) & Constants.Permissions.EMBED_LINKS);

                    if (!isEmbedSuppressed && !message.embeds.length) return res;
                    if (message.author.id === Users.getCurrentUser().id && !hasEmbedPerms) return res;

                    const buttonPosition = deleteButtonGroup?.findIndex(i => i.props?.label === Locale.Messages.DELETE_MESSAGE);
                    if (buttonPosition === -1) return res;

                    const Label = isEmbedSuppressed ? `Unsuppress Embed${isEmbedSuppressed ? "s" : ""}` : `Suppress Embed${isEmbedSuppressed ? "s" : ""}`
                    const Icon = isEmbedSuppressed ? getIDByName("RetryIcon") : getIDByName("ic_close_16px");
                    deleteButtonGroup.splice(buttonPosition, 0, (
                        <ActionRow
                            label={Label}
                            color={isEmbedSuppressed ? null : "danger"}
                            icon={Icon}
                            onPress={() => {
                                REST.patch({
                                    url: `/channels/${channel.id}/messages/${message.id}`,
                                    body: { flags: isEmbedSuppressed ? message.flags & ~EMBED_SUPPRESSED : message.flags | EMBED_SUPPRESSED }
                                });
                                LazyActionSheet.hideActionSheet();
                            }}
                        />
                    ));
                });
            });
        });
    },
    onStop() {
        Patcher.unpatchAll();
    },
    getSettingsPanel({ settings }) {
        return <Settings settings={settings} />;
    }
};

registerPlugin(UnsuppressEmbeds);
