import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { usePasswordInputStyles } from "../styles/components";
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

    const styles = usePasswordInputStyles();

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

export default PasswordInput;
