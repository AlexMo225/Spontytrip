import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/Avatar";
import { Colors } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../hooks/useModal";
import { useEditProfileStyles } from "../styles/screens/editProfileStyles";
import { RootStackParamList } from "../types";

type EditProfileScreenProps = {
    navigation: StackNavigationProp<RootStackParamList>;
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
    navigation,
}) => {
    const styles = useEditProfileStyles();
    const modal = useModal();
    const { user, updateProfile, updateEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || "",
                email: user.email || "",
            });
            setProfileImage(user.photoURL);
        }
    }, [user]);

    const handleImagePicker = async () => {
        const { granted } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!granted) {
            modal.showConfirm(
                "Permission requise",
                "L'accès à la galerie photo est nécessaire pour changer votre photo de profil.",
                () => {
                    // Ouvrir les paramètres
                },
                () => {},
                "Paramètres",
                "Annuler"
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = "Le nom est requis";
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!user || !validateForm()) return;

        setIsLoading(true);
        try {
            if (
                formData.displayName !== user.displayName ||
                profileImage !== user.photoURL
            ) {
                await updateProfile({
                    displayName: formData.displayName,
                    photoURL: profileImage || undefined,
                });
            }

            if (formData.email !== user.email) {
                await updateEmail(formData.email);
            }

            modal.showSuccess(
                "Profil mis à jour",
                "Vos modifications ont été enregistrées avec succès !"
            );
            navigation.goBack();
        } catch (error) {
            modal.showError(
                "Erreur",
                "Une erreur est survenue lors de la mise à jour du profil."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        modal.showConfirm(
            "Supprimer le compte",
            "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
            () => {
                // Logique de suppression du compte
            },
            () => {},
            "Supprimer",
            "Annuler"
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.headerButtonText}>Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le profil</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    <Text style={styles.headerButtonText}>
                        {isLoading ? "..." : "Enregistrer"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.section, styles.profileSection]}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            imageUrl={profileImage || undefined}
                            size={120}
                            showBorder
                        />
                        <TouchableOpacity
                            style={styles.editPhotoButton}
                            onPress={handleImagePicker}
                        >
                            <Ionicons
                                name="camera"
                                size={20}
                                color={Colors.white}
                            />
                        </TouchableOpacity>
                    </View>

                    {user?.createdAt && (
                        <View style={styles.memberSinceContainer}>
                            <Text style={styles.memberSinceText}>
                                Membre depuis le
                            </Text>
                            <Text style={styles.memberSinceDate}>
                                {formatDate(user.createdAt)}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nom complet</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.displayName && {
                                    borderColor: Colors.error,
                                },
                            ]}
                            value={formData.displayName}
                            onChangeText={(text) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    displayName: text,
                                }))
                            }
                            placeholder="Votre nom complet"
                            placeholderTextColor={Colors.text.secondary}
                        />
                        {errors.displayName && (
                            <Text style={styles.errorText}>
                                {errors.displayName}
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.email && { borderColor: Colors.error },
                            ]}
                            value={formData.email}
                            onChangeText={(text) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: text,
                                }))
                            }
                            placeholder="Votre email"
                            placeholderTextColor={Colors.text.secondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <Ionicons
                                    name="save-outline"
                                    size={20}
                                    color={Colors.white}
                                />
                                <Text
                                    style={[
                                        styles.buttonText,
                                        styles.primaryButtonText,
                                    ]}
                                >
                                    Enregistrer les modifications
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, styles.dangerSection]}>
                    <Text style={styles.dangerTitle}>Zone dangereuse</Text>
                    <Text style={styles.dangerText}>
                        La suppression de votre compte est irréversible. Toutes
                        vos données seront définitivement supprimées.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={handleDeleteAccount}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={20}
                            color={Colors.error}
                        />
                        <Text
                            style={[styles.buttonText, styles.deleteButtonText]}
                        >
                            Supprimer mon compte
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditProfileScreen;
