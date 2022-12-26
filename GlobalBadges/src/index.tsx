import { get, set } from "enmity/api/settings";
import { Image, TouchableOpacity, View } from "enmity/components";
import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { getByName } from "enmity/metro";
import { React, Toasts } from "enmity/metro/common";
import { create } from "enmity/patcher";
import Settings from "./components/Settings";
import { hasUpdate, showUpdateDialog, showChangelog } from "./pluginUpdater";
import manifest from "../manifest.json";
import { BadgeCache, CustomBadges } from "./types";

const cache = new Map<string, BadgeCache>();
const EXPIRES = 1000 * 60 * 15;

const BADGES = {
    aliucord: {
        dev: {
            name: "Aliucord Developer",
            img: "https://cdn.discordapp.com/emojis/860599530956783656.png"
        },
        donor: {
            name: "Aliucord Donor",
            img: "https://cdn.discordapp.com/emojis/859801776232202280.png"
        },
        contributor: {
            name: "Aliucord Contributor",
            img: "https://cdn.discordapp.com/emojis/894346480943530015.png"
        }
    },
    betterdiscord: {
        developer: {
            name: "BetterDiscord Developer",
            img: "https://cdn.discordapp.com/emojis/1019671156523012136.png"
        }
    },
    velocity: {
        developer: {
            name: "Velocity Developer",
            img: "https://cdn.discordapp.com/emojis/959998683770941460.png"
        },
        translator: {
            name: "Velocity Translator",
            img: "https://cdn.discordapp.com/emojis/959998683770941460.png"
        }
    },
    vencord: {
        contributor: {
            name: "Vencord Contributor",
            img: "https://media.discordapp.net/stickers/1026517526106087454.png"
        }
    }
};

const fetchBadges = (id: string, setBadges: Function) => {
    if (!cache.has(id) || cache.get(id)?.expires < Date.now()) {
        fetch(`https://clientmodbadges-api.herokuapp.com/users?user=${id}`)
            .then((res) => res.json() as Promise<CustomBadges>)
            .then((body) => {
                cache.set(id, { badges: body, expires: Date.now() + EXPIRES });
                setBadges(body);
            });
    } else setBadges(cache.get(id)?.badges);
};

const Badge = ({ name, img }: { name: string, img: string }) => {
    const styles = {
        wrapper: {
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "flex-end"
        },
        image: {
            width: 24,
            height: 24,
            resizeMode: "contain",
            marginHorizontal: 2
        }
    };

    return <View style={styles.wrapper}>
        <TouchableOpacity onPress={() => Toasts.open({ content: name, source: { uri: img } })}>
            <Image style={styles.image} source={{ uri: img }} />
        </TouchableOpacity>
    </View>;
};

const Patcher = create(manifest.name);
const GlobalBadges: Plugin = {
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

        const ProfileBadges = getByName("ProfileBadges", { all: true, default: false });
        for (const profileBadge of ProfileBadges) {
            Patcher.after(profileBadge, "default", (_, [{ user: { id } }], res) => {
                const [badges, setBadges] = React.useState({} as CustomBadges);
                React.useEffect(() => fetchBadges(id, setBadges), []);
                const globalBadges = [];
                Object.keys(badges).forEach((mod) => {
                    badges[mod].forEach((badge) => {
                        if (mod == "velocity") badge = badge.replace("Velocity ", "");
                        const [name, extra] = badge.toLowerCase().split(" ");
                        if (BADGES[mod] && BADGES[mod][name]) {
                            const badgeName = extra ? `${BADGES[mod][name].name} ${extra}` : BADGES[mod][name].name;
                            globalBadges.push(<Badge name={badgeName} img={BADGES[mod][name].img} />);
                        }
                    });
                });
                
                if (!globalBadges.length) return res;
                if (res.props.badges) res.props.badges.push(...globalBadges);
                else res.props.children.push(...globalBadges);
            });
        }
    },
    onStop() { Patcher.unpatchAll(); },
    getSettingsPanel({ settings }) {
        return <Settings settings={settings} />;
    }
};

registerPlugin(GlobalBadges);