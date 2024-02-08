import manifest from "@SuppressEmbeds/manifest.json";
import { getIDByName } from "enmity/api/assets";
import { FormRow } from "enmity/components";
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
        /*
         * Code from https://github.com/aeongdesu/ermplugins/blob/main/plugins/ViewRaw/src/index.tsx
         * Thanks aeongdesu <3
         */
        Patcher.before(LazyActionSheet, "openLazy", (_, [component, key, msg]) => {
            const message = msg?.message;
            if (key !== "MessageLongPressActionSheet" || !message) return;
            component.then(instance => {
                const unpatch = Patcher.after(instance, "default", (_, __, res) => {
                    React.useEffect(() => () => { unpatch(); }, []);
                    const buttons = findInReactTree(res, x => x?.[0]?.type?.name === "ButtonRow");
                    if (!buttons) return res;

                    const channel = ChannelStore.getChannel(message.channel_id);
                    const isEmbedSuppressed = !!(message.flags & EMBED_SUPPRESSED);
                    const hasEmbedPerms = !!(PermissionStore.getChannelPermissions({ id: message.channel_id }) & Constants.Permissions.EMBED_LINKS);

                    if (!isEmbedSuppressed && !message.embeds.length) return;
                    if (message.author.id === Users.getCurrentUser().id && !hasEmbedPerms) return;


                    const buttonPosition = buttons?.findIndex(i => i.props?.message === Locale.Messages.DELETE_MESSAGE);
                    if (buttonPosition === -1) return;

                    buttons.splice(buttonPosition, 0, (
                        <FormRow
                            key={manifest.name}
                            label={isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds"}
                            leading={<FormRow.Icon
                                source={isEmbedSuppressed ?
                                    getIDByName("ic_message_retry") :
                                    getIDByName("ic_close_16px")
                                }
                            />}
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
