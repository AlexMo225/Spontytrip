import React from "react";
import { StyleSheet, View } from "react-native";

interface AddActivityProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export const AddActivityProgressBar: React.FC<AddActivityProgressBarProps> = ({
    currentStep,
    totalSteps,
}) => {
    return (
        <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }, (_, index) => (
                <View
                    key={index}
                    style={[
                        styles.progressDot,
                        index + 1 <= currentStep
                            ? styles.progressDotActive
                            : styles.progressDotInactive,
                        index + 1 === currentStep && styles.progressDotCurrent,
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressDotActive: {
        backgroundColor: "#4DA1A9",
    },
    progressDotInactive: {
        backgroundColor: "#E5E7EB",
    },
    progressDotCurrent: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#4DA1A9",
    },
});
