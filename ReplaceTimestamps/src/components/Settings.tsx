/*
 *   Full Credits to acquitelol (https://github.com/acquitelol/)
 *   Code taken from https://github.com/acquitelol/dislate/blob/main/src/components/Settings.tsx
 *   and https://github.com/acquitelol/dislate/blob/main/src/components/Credits.tsx
 */

import { FormRow, FormSection, ScrollView, Text, View } from "enmity/components";
import { Constants, Navigation, React, StyleSheet, Toasts } from "enmity/metro/common";
import { name, sourceUrl, version } from "../../manifest.json";
import { getByProps } from "enmity/metro";
import { hasUpdate, showUpdateDialog } from "../pluginUpdater";

const Router = getByProps("transitionToGuild");

export default () => {
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
                onTouchStart={(e) => {
                    setTouchX(e.nativeEvent.pageX);
                    setTouchY(e.nativeEvent.pageY);
                }}
                onTouchEnd={(e) => {
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
                            <Text style={[styles.main_text, styles.sub_header]}>Version:</Text>
                            <Text
                                style={[
                                    styles.main_text,
                                    styles.sub_header,
                                    { paddingLeft: 4, fontFamily: Constants.Fonts.DISPLAY_BOLD },
                                ]}
                            >
                                {" "}
                                {version}
                            </Text>
                        </View>
                    </View>
                </View>
                <FormSection title="Source">
                    <FormRow
                        label="Check for Updates"
                        trailing={FormRow.Arrow}
                        onPress={() => {
                            hasUpdate().then((b) => {
                                if (b) showUpdateDialog();
                                else Toasts.open({ content: "You're already on the latest version" });
                            });
                        }}
                    />
                    <FormRow
                        label="Source"
                        subLabel={`See the Source Code for ${name}`}
                        trailing={FormRow.Arrow}
                        onPress={() => Router?.openURL(sourceUrl)}
                    />
                </FormSection>
            </ScrollView>
        </>
    );
};
