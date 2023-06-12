import { Image, TouchableOpacity, View } from "enmity/components";
import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { getByName } from "enmity/metro";
import { React, Toasts } from "enmity/metro/common";
import { create } from "enmity/patcher";
import { get } from "enmity/api/settings";

import manifest from "@GlobalBadges/manifest.json";
import Settings from "./components/Settings";
import { BadgeCache, CustomBadge } from "./types";

const API_URL = "https://clientmodbadges-api.herokuapp.com/";

const cache = new Map<string, BadgeCache>();
const EXPIRES = 1000 * 60 * 15;

const fetchBadges = (id: string): BadgeCache["badges"] | undefined => {
    const cachedValue = cache.get(id);
    if (!cache.has(id) || (cachedValue && cachedValue.expires < Date.now())) {
        fetch(`${API_URL}users/${id}`)
            .then(res => res.json() as Promise<BadgeCache["badges"]>)
            .then(body => {
                cache.set(id, { badges: body, expires: Date.now() + EXPIRES });
                return body;
            });
    } else if (cachedValue) return cachedValue.badges;
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
        const ProfileBadges = getByName("ProfileBadges", { all: true, default: false });
        for (const profileBadge of ProfileBadges) {
            Patcher.after(profileBadge, "default", (_, [{ user: { id } }], res) => {
                const [badges, setBadges] = React.useState<BadgeCache["badges"]>({});
                React.useEffect(() => setBadges(fetchBadges(id) ?? {}), []);

                if (!badges) return null;
                const globalBadges: any[] = [];

                if (!badges) return res;
                Object.keys(badges).forEach(mod => {
                    if (mod.toLowerCase() === "enmity") return;
                    badges[mod].forEach((badge: CustomBadge) => {
                        if (typeof badge === "string") {
                            const fullNames = { "hunter": "Bug Hunter", "early": "Early User" };
                            badge = {
                                name: fullNames[badge as string] ? fullNames[badge as string] : badge,
                                badge: `${API_URL}badges/${mod}/${(badge as string).replace(mod, "").trim().split(" ")[0]}`
                            };
                        } else if (typeof badge === "object") badge.custom = true;
                        if (!get(manifest.name, "showCustom", true) && badge.custom) return;
                        const cleanName = badge.name.replace(mod, "").trim();
                        const prefix = get(manifest.name, "showPrefix", true) ? mod : "";
                        if (!badge.custom) badge.name = `${prefix} ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
                        globalBadges.push(<Badge name={badge.name} img={badge.badge} />);
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