import manifest from "@UnsuppressEmbeds/manifest.json";
import { getIDByName } from "enmity/api/assets";
import { FormRow } from "enmity/components";
import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { bulk, filters } from "enmity/metro";
import { Constants, React, REST } from "enmity/metro/common";
import { create } from "enmity/patcher";
import { findInReactTree } from "enmity/utilities";

import Settings from "./components/Settings";

const EMBED_SUPPRESSED = 1 << 2;

const [
    ActionSheet,
    ChannelStore,
    i18n,
    Icon,
    LazyActionSheet,
    PermissionStore,
    UserStore
] = bulk(
    filters.byName("ActionSheet", false),
    filters.byProps("getChannel"),
    filters.byProps("Messages"),
    filters.byName("Icon"),
    filters.byProps("openLazy", "hideActionSheet"),
    filters.byProps("getChannelPermissions"),
    filters.byProps("getCurrentUser", "getUser")
);

const Patcher = create(manifest.name);
const UnsuppressEmbeds: Plugin = {
    ...manifest,
    onStart() {
        /*
         * Code from https://github.com/acquitelol/dislate/blob/main/src/index.tsx
         * Thanks rosie <3
         */
        Patcher.after(ActionSheet, "default", (_, __, res) => {
            const FinalLocation = findInReactTree(res, r => r.sheetKey);
            if (FinalLocation?.sheetKey && FinalLocation.sheetKey !== "MessageLongPressActionSheet") return;

            Patcher.after(FinalLocation?.content, "type", (_, [{ message }], res) => {
                const channel = ChannelStore.getChannel(message.channel_id);
                const isEmbedSuppressed = !!(message.flags & EMBED_SUPPRESSED);
                const hasEmbedPerms = !!(PermissionStore.getChannelPermissions({ id: message.channel_id }) & Constants.Permissions.EMBED_LINKS);

                if (!isEmbedSuppressed && !message.embeds.length) return;
                if (message.author.id === UserStore.getCurrentUser().id && !hasEmbedPerms) return;

                const finalLocation = findInReactTree(res, r =>
                    Array.isArray(r) &&
                    r.find(o =>
                        typeof o?.key === "string" &&
                        typeof o?.props?.message === "string"
                    )
                );
                const buttonPosition = finalLocation?.findIndex(i =>
                    i.props?.message === i18n.Messages.DELETE_MESSAGE
                );

                if (buttonPosition === -1) return;

                finalLocation.splice(buttonPosition, 0, (
                    <FormRow
                        key={manifest.name}
                        label={isEmbedSuppressed ? "Unsuppress Embeds" : "Suppress Embeds"}
                        leading={<Icon
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
    },
    onStop() {
        Patcher.unpatchAll();
    },
    getSettingsPanel({ settings }) {
        return <Settings settings={settings} />;
    }
};

registerPlugin(UnsuppressEmbeds);
