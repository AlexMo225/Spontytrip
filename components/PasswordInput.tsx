import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import {
    PasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthLabel,
    validatePassword,
} from "../utils/passwordUtils";

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: ViewStyle;
    editable?: boolean;
    showStrengthIndicator?: boolean;
    error?: string;
}

const PasswordInput: React.FC<Props> = ({
    value,
    onChangeText,
    placeholder = "Mot de passe",
    style,
    editable = true,
    showStrengthIndicator = true,
    error,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        isStrong: false,
        feedback: "",
    });

    const handleChangeText = (text: string) => {
        onChangeText(text);
        if (showStrengthIndicator) {
            setPasswordStrength(validatePassword(text));
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View style={[styles.container, style]}>
            <View
                style={[
                    styles.inputContainer,
                    error && styles.inputContainerError,
                ]}
            >
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={editable}
                    textContentType="oneTimeCode"
                    passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: [-];"
                    maxLength={32}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={toggleShowPassword}
                    disabled={!editable}
                >
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color={Colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                showStrengthIndicator &&
                value.length > 0 && (
                    <View style={styles.strengthContainer}>
                        <View style={styles.strengthBars}>
                            {[0, 1, 2, 3].map((index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.strengthBar,
                                        {
                                            backgroundColor:
                                                index < passwordStrength.score
                                                    ? getPasswordStrengthColor(
                                                          passwordStrength.score
                                                      )
                                                    : Colors.border,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        <Text
                            style={[
                                styles.strengthText,
                                {
                                    color: getPasswordStrengthColor(
                                        passwordStrength.score
                                    ),
                                },
                            ]}
                        >
                            {getPasswordStrengthLabel(passwordStrength.score)}
                        </Text>
                        {passwordStrength.feedback !== "Mot de passe fort" && (
                            <Text style={styles.feedbackText}>
                                {passwordStrength.feedback}
                            </Text>
                        )}
                    </View>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        height: 56,
    },
    inputContainerError: {
        borderColor: Colors.error,
    },
    input: {
        flex: 1,
        ...TextStyles.body1,
        height: "100%",
        paddingHorizontal: Spacing.md,
        color: Colors.textPrimary,
    },
    eyeButton: {
        padding: Spacing.sm,
        marginRight: Spacing.xs,
    },
    strengthContainer: {
        marginTop: Spacing.xs,
    },
    strengthBars: {
        flexDirection: "row",
        marginBottom: Spacing.xxs,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 2,
    },
    strengthText: {
        ...TextStyles.caption,
        marginBottom: Spacing.xxs,
    },
    feedbackText: {
        ...TextStyles.caption,
        color: Colors.textSecondary,
    },
    errorText: {
        ...TextStyles.caption,
        color: Colors.error,
        marginTop: Spacing.xs,
    },
});

export default PasswordInput;
