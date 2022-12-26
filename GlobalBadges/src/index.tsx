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
    aliu: {
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
    bd: {
        dev: {
            name: "BetterDiscord Developer",
            img: "https://cdn.discordapp.com/emojis/1019671156523012136.png"
        }
    }
};

const fetchBadges = (id: string, setBadges: Function) => {
    if (!cache.has(id) || cache.get(id)?.expires < Date.now()) {
        fetch(`https://api.obamabot.me/v2/text/badges?user=${id}`)
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
                if (Object.keys(badges).length === 0 && badges.constructor === Object) return;
                const globalBadges = [];
                for (const key in badges) {
                    const group = badges[key];
                    for (const badge in group) {
                        if (group[badge] && typeof group[badge] !== "object") globalBadges.push(<Badge name={BADGES[key][badge].name} img={BADGES[key][badge].img} />);
                    }
                }
                console.log(globalBadges);
                if (!globalBadges.length) return res;
                res.props.children = [...res.props.children, ...globalBadges];
            });
        }
    },
    onStop() { Patcher.unpatchAll(); },
    getSettingsPanel({ settings }) {
        return <Settings settings={settings} />;
    }
};

registerPlugin(GlobalBadges);