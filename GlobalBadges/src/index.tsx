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
                const globalBadges: any[] = []
                if (!badges) return res;
                Object.keys(badges).forEach((mod) => {
                    if (mod.toLowerCase() === "enmity" || !get(manifest.name, `show${mod}`, true)) return;
                    badges[mod].forEach((badge) => {
                        const badgeImg = `${API_URL}badges/${mod}/${badge.replace(mod, "").trim().split(" ")[0]}`;
                        const _ = {
                            "hunter": "Bug Hunter",
                            "early": "Early User"
                        }
                        if (_[badge]) badge = _[badge];
                        const cleanName = badge.replace(mod, "").trim();
                        const badgeName = `${mod} ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
                        globalBadges.push(<Badge name={badgeName} img={badgeImg} />);
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