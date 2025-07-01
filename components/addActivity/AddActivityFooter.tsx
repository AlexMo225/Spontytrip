import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AddActivityFooterProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
}

export const AddActivityFooter: React.FC<AddActivityFooterProps> = ({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
}) => {
    const canGoPrevious = currentStep > 1;
    const canGoNext = currentStep < totalSteps;

    return (
        <View style={styles.footer}>
            <TouchableOpacity
                style={[
                    styles.footerButton,
                    !canGoPrevious && styles.footerButtonDisabled,
                ]}
                onPress={onPrevious}
                disabled={!canGoPrevious}
            >
                <Ionicons
                    name="arrow-back"
                    size={20}
                    color={canGoPrevious ? "#4DA1A9" : "#9CA3AF"}
                />
                <Text
                    style={[
                        styles.footerButtonText,
                        !canGoPrevious && styles.footerButtonTextDisabled,
                    ]}
                >
                    Précédent
                </Text>
            </TouchableOpacity>

            <View style={styles.footerCenter}>
                <Text style={styles.stepIndicator}>
                    {currentStep}/{totalSteps}
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.footerButton,
                    !canGoNext && styles.footerButtonDisabled,
                ]}
                onPress={onNext}
                disabled={!canGoNext}
            >
                <Text
                    style={[
                        styles.footerButtonText,
                        !canGoNext && styles.footerButtonTextDisabled,
                    ]}
                >
                    Suivant
                </Text>
                <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={canGoNext ? "#4DA1A9" : "#9CA3AF"}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    footerButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
    },
    footerButtonDisabled: {
        opacity: 0.5,
    },
    footerButtonText: {
        fontSize: 16,
        color: "#4DA1A9",
        marginHorizontal: 8,
    },
    footerButtonTextDisabled: {
        color: "#9CA3AF",
    },
    footerCenter: {
        alignItems: "center",
    },
    stepIndicator: {
        fontSize: 14,
        color: "#6B7280",
    },
});
