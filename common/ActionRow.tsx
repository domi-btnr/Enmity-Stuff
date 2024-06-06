/**
 * Code taken from
 * https://github.com/aeongdesu/ermplugins/blob/main/utils/ActionRow.tsx
 */

import { Image } from "enmity/components";
import { getByProps } from "enmity/metro";
import { ColorMap, React, StyleSheet } from "enmity/metro/common";

const { ActionSheetRow } = getByProps("ActionSheetRow");
const { FormRow } = getByProps("FormRow");

export default ({
    key,
    label,
    color,
    icon,
    onPress,
}: {
    key?: string | null;
    label: string;
    color?: string | null;
    icon: number
    onPress?: () => void
}) => {
    const styles = StyleSheet.createThemedStyleSheet({
        iconComponent: {
            width: 24,
            height: 24,
            tintColor: ColorMap.colors.INTERACTIVE_NORMAL,
        }
    });

    return ActionSheetRow ? (
        <ActionSheetRow
            label={label}
            {...(key && { key })}
            {...(color && { variant: color })}
            icon={
                <ActionSheetRow.Icon
                    source={icon}
                    IconComponent={() => (
                        <Image
                            resizeMode="cover"
                            source={icon}
                            style={[styles.iconComponent, color === "danger" && { tintColor: "#f9777b" }]}
                            /* Hardcoded Color since ColorMap.colors did not work */
                        />
                    )}
                />
            }
            onPress={onPress}
        />
    ) : (
        <FormRow
            label={label}
            leading={<FormRow.Icon source={icon} />}
            onPress={onPress}
        />
    );
};
