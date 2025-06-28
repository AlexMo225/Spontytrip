import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Fonts } from "../constants/Fonts";

export type ModalType = "success" | "error" | "warning" | "info" | "confirm";

export interface ModalButton {
    text: string;
    onPress: () => void;
    style?: "default" | "destructive" | "cancel";
    primary?: boolean;
}

interface SpontyModalProps {
    visible: boolean;
    type: ModalType;
    title: string;
    message?: string;
    buttons: ModalButton[];
    onClose?: () => void;
    autoCloseDelay?: number; // en millisecondes, pour les success/info
    hideIcon?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const SpontyModal: React.FC<SpontyModalProps> = ({
    visible,
    type,
    title,
    message,
    buttons,
    onClose,
    autoCloseDelay,
    hideIcon = false,
}) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            // Animation d'entrée
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-fermeture pour success/info
            if (autoCloseDelay && (type === "success" || type === "info")) {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);

                return () => clearTimeout(timer);
            }
        } else {
            // Animation de sortie
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, autoCloseDelay, type]);

    const handleClose = () => {
        onClose?.();
    };

    const getIconConfig = () => {
        switch (type) {
            case "success":
                return {
                    name: "checkmark-circle" as const,
                    color: "#7ED957",
                    backgroundColor: "#7ED95720",
                };
            case "error":
                return {
                    name: "close-circle" as const,
                    color: "#EF4444",
                    backgroundColor: "#EF444420",
                };
            case "warning":
                return {
                    name: "warning" as const,
                    color: "#F59E0B",
                    backgroundColor: "#F59E0B20",
                };
            case "info":
                return {
                    name: "information-circle" as const,
                    color: "#4DA1A9",
                    backgroundColor: "#4DA1A920",
                };
            case "confirm":
                return {
                    name: "help-circle" as const,
                    color: "#4DA1A9",
                    backgroundColor: "#4DA1A920",
                };
            default:
                return {
                    name: "information-circle" as const,
                    color: "#4DA1A9",
                    backgroundColor: "#4DA1A920",
                };
        }
    };

    const iconConfig = getIconConfig();

    const getButtonStyle = (button: ModalButton, index: number) => {
        if (
            button.primary ||
            (buttons.length === 1 && button.style !== "cancel")
        ) {
            return [
                styles.button,
                styles.primaryButton,
                type === "error" && styles.errorButton,
            ];
        }
        if (button.style === "destructive") {
            return [styles.button, styles.destructiveButton];
        }
        if (button.style === "cancel") {
            return [styles.button, styles.cancelButton];
        }
        return [styles.button, styles.secondaryButton];
    };

    const getButtonTextStyle = (button: ModalButton) => {
        if (
            button.primary ||
            (buttons.length === 1 && button.style !== "cancel")
        ) {
            return [styles.buttonText, styles.primaryButtonText];
        }
        if (button.style === "destructive") {
            return [styles.buttonText, styles.destructiveButtonText];
        }
        if (button.style === "cancel") {
            return [styles.buttonText, styles.cancelButtonText];
        }
        return [styles.buttonText, styles.secondaryButtonText];
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <Animated.View
                style={[
                    styles.overlay,
                    {
                        opacity: fadeAnim,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim },
                            ],
                        },
                    ]}
                >
                    {/* Icône */}
                    {!hideIcon && (
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: iconConfig.backgroundColor },
                            ]}
                        >
                            <Ionicons
                                name={iconConfig.name}
                                size={32}
                                color={iconConfig.color}
                            />
                        </View>
                    )}

                    {/* Contenu */}
                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        {message && (
                            <Text style={styles.message}>{message}</Text>
                        )}
                    </View>

                    {/* Boutons */}
                    <View
                        style={[
                            styles.buttonsContainer,
                            buttons.length === 1
                                ? styles.singleButtonContainer
                                : styles.multipleButtonsContainer,
                        ]}
                    >
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={getButtonStyle(button, index)}
                                onPress={() => {
                                    button.onPress();
                                    handleClose();
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={getButtonTextStyle(button)}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingTop: 32,
        paddingHorizontal: 24,
        paddingBottom: 24,
        width: "100%",
        maxWidth: 380,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    content: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 8,
        fontFamily: Fonts.heading.family,
        lineHeight: 28,
    },
    message: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        fontFamily: Fonts.body.family,
    },
    buttonsContainer: {
        width: "100%",
    },
    singleButtonContainer: {
        alignItems: "center",
    },
    multipleButtonsContainer: {
        gap: 12,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
    },
    primaryButton: {
        backgroundColor: "#7ED957",
        shadowColor: "#7ED957",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    errorButton: {
        backgroundColor: "#EF4444",
        shadowColor: "#EF4444",
    },
    destructiveButton: {
        backgroundColor: "#EF4444",
        shadowColor: "#EF4444",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: "#4DA1A9",
        shadowColor: "#4DA1A9",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#D1D5DB",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        fontFamily: Fonts.body.family,
    },
    primaryButtonText: {
        color: "#FFFFFF",
    },
    destructiveButtonText: {
        color: "#FFFFFF",
    },
    secondaryButtonText: {
        color: "#FFFFFF",
    },
    cancelButtonText: {
        color: "#6B7280",
    },
});

export default SpontyModal;
