/*
 *   Full Credits to acquitelol (https://github.com/acquitelol/)
 *   Code taken from https://github.com/acquitelol/dislate/blob/main/src/components/Settings.tsx
 *   and https://github.com/acquitelol/dislate/blob/main/src/components/Credits.tsx
 */

import pluginUpdater from "@common/pluginUpdater.ts";
import manifest, { authors, changelog, hash, name, sourceUrl, version } from "@GlobalBadges/manifest.json";
import { SettingsStore } from "enmity/api/settings";
import { FormRow, FormSection, FormSwitch, ScrollView, Text, View } from "enmity/components";
import { Constants, Navigation, React, StyleSheet, Linking } from "enmity/metro/common";

interface SettingsProps {
    settings: SettingsStore;
}

pluginUpdater.create(manifest);
export default ({ settings }: SettingsProps) => {
    const styles = StyleSheet.createThemedStyleSheet({
        item: { color: Constants.ThemeColorMap.TEXT_MUTED },
        text_container: {
            paddingLeft: 15,
            paddingTop: 5,
            flexDirection: "column",
            flexWrap: "wrap",
        },
        main_text: {
            opacity: 0.975,
            letterSpacing: 0.25,
        },
        header: {
            color: Constants.ThemeColorMap.HEADER_PRIMARY,
            fontFamily: Constants.Fonts.DISPLAY_BOLD,
            fontSize: 25,
            letterSpacing: 0.25,
        },
        sub_header: {
            color: Constants.ThemeColorMap.HEADER_SECONDARY,
            opacity: 0.975,
            fontSize: 12.75,
        },
    });

    const [touchX, setTouchX] = React.useState();
    const [touchY, setTouchY] = React.useState();

    return (
        <>
            <ScrollView
                onTouchStart={e => {
                    setTouchX(e.nativeEvent.pageX);
                    setTouchY(e.nativeEvent.pageY);
                }}
                onTouchEnd={e => {
                    if (
                        touchX - e.nativeEvent.pageX < -100 &&
                        touchY - e.nativeEvent.pageY < 40 &&
                        touchY - e.nativeEvent.pageY > -40
                    )
                        Navigation.pop();
                }}
            >
                <View>
                    <View style={styles.text_container}>
                        <Text style={[styles.main_text, styles.header]}>{name}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.main_text, styles.sub_header]}>Author:</Text>
                            <Text
                                style={[
                                    styles.main_text,
                                    styles.sub_header,
                                    { paddingLeft: 4, fontFamily: Constants.Fonts.DISPLAY_BOLD },
                                ]}
                            >
                                {` ${authors.map(a => a.name).join(", ")}`}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.main_text, styles.sub_header]}>Version:</Text>
                            <Text
                                style={[
                                    styles.main_text,
                                    styles.sub_header,
                                    { paddingLeft: 4, fontFamily: Constants.Fonts.DISPLAY_BOLD },
                                ]}
                            >
                                {` ${version}`}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.main_text, styles.sub_header]}>Hash:</Text>
                            <Text
                                style={[
                                    styles.main_text,
                                    styles.sub_header,
                                    { paddingLeft: 4, fontFamily: Constants.Fonts.DISPLAY_BOLD },
                                ]}
                            >
                                {` ${hash.slice(0, 7)}`}
                            </Text>
                        </View>
                    </View>
                </View>
                <FormSection title="Badges">
                    <FormRow
                        label="Prefix"
                        subLabel="Shows the Mod as Prefix"
                        trailing={
                            <FormSwitch
                                value={settings.getBoolean("showPrefix", true)}
                                onValueChange={() => settings.toggle("showPrefix", true)}
                            />
                        }
                    />
                    <FormRow
                        label="Custom Badges"
                        subLabel="Show Custom Badges"
                        trailing={
                            <FormSwitch
                                value={settings.getBoolean("showCustom", true)}
                                onValueChange={() => settings.toggle("showCustom", true)}
                            />
                        }
                    />
                </FormSection>
                <FormSection title="Updates">
                    <FormRow
                        label="Check for Updates on startup"
                        subLabel={`Checks automatically for updates when starting ${name}`}
                        trailing={
                            <FormSwitch
                                value={settings.getBoolean("autoUpdateCheck", true)}
                                onValueChange={() => settings.toggle("autoUpdateCheck", true)}
                            />
                        }
                    />
                    <FormRow
                        label="Check for Updates"
                        trailing={FormRow.Arrow}
                        onPress={() => pluginUpdater.checkForUpdates(true)}
                    />
                    <FormRow
                        label="Show Changelog"
                        subLabel={`Shows the changelog for v${version}`}
                        trailing={FormRow.Arrow}
                        onPress={() => pluginUpdater.showChangelog()}
                        disabled={!changelog.length}
                    />
                </FormSection>
                <FormSection title="Source">
                    <FormRow
                        label="Source"
                        subLabel={`View the source code for ${name}`}
                        trailing={FormRow.Arrow}
                        onPress={() => Linking.openURL(sourceUrl)}
                    />
                </FormSection>
            </ScrollView>
        </>
    );
};
