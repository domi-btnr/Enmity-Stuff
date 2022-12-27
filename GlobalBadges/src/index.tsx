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

const API_URL = "https://clientmodbadges-api.herokuapp.com/";

const cache = new Map<string, BadgeCache>();
const EXPIRES = 1000 * 60 * 15;

const BADGES = {
    aliucord: {
        dev: {
            name: "Aliucord Developer"
        },
        donor: {
            name: "Aliucord Donor"
        },
        contributor: {
            name: "Aliucord Contributor"
        }
    },
    betterdiscord: {
        developer: {
            name: "BetterDiscord Developer"
        }
    },
    replugged: {
        developer: {
            name: "Replugged Developer"
        },
        staff: {
            name: "Replugged Staff"
        },
        support: {
            name: "Replugged Support"
        },
        contributor: {
            name: "Replugged Contributor"
        },
        translator: {
            name: "Replugged Translator"
        },
        hunter: {
            name: "Replugged Bug Hunter"
        },
        early: {
            name: "Replugged Early User"
        }
    },
    velocity: {
        developer: {
            name: "Velocity Developer"
        },
        early: {
            name: "Velocity Early"
        },
        translator: {
            name: "Velocity Translator"
        }
    },
    vencord: {
        contributor: {
            name: "Vencord Contributor"
        }
    }
};

const fetchBadges = (id: string, setBadges: Function) => {
    if (!cache.has(id) || cache.get(id)?.expires < Date.now()) {
        fetch(`${API_URL}users/${id}`)
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
                        let [name, extra] = badge.split(" ");
                        name = name.toLowerCase();
                        if (BADGES[mod] && BADGES[mod][name]) {
                            const badgeName = extra ? `${BADGES[mod][name].name} ${extra}` : BADGES[mod][name].name;
                            globalBadges.push(<Badge name={badgeName} img={`${API_URL}badges/${mod}/${name}`} />);
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