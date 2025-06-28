import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "../hooks/useModal";
import { RootStackParamList } from "../types";

const { width: screenWidth } = Dimensions.get("window");

type EditProfileScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "EditProfile"
>;
type EditProfileScreenRouteProp = RouteProp<RootStackParamList, "EditProfile">;

interface Props {
    navigation: EditProfileScreenNavigationProp;
    route: EditProfileScreenRouteProp;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user, updateProfile, updateEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        birthDate: "",
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newImageSelected, setNewImageSelected] = useState(false);
    const insets = useSafeAreaInsets();

    // Initialiser les données du formulaire avec les données utilisateur
    useEffect(() => {
        if (user) {
            const [firstName = "", lastName = ""] = (
                user.displayName || ""
            ).split(" ");
            setFormData({
                firstName,
                lastName,
                email: user.email || "",
                phone: "",
                bio: "",
                location: "",
                birthDate: "",
            });
            setProfileImage(user.photoURL);
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImagePicker = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            modal.showConfirm(
                "Permission requise 📸",
                "L'accès à la galerie photo est nécessaire pour changer votre photo de profil. Voulez-vous ouvrir les paramètres ?",
                () => {
                    // Ouvrir les paramètres de l'app (si disponible)
                    console.log("Ouverture des paramètres demandée");
                },
                () => {},
                "Paramètres",
                "Plus tard"
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
            setNewImageSelected(true);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setIsLoading(true);

        try {
            // Mise à jour du displayName si modifié
            const newDisplayName =
                `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
            const currentDisplayName = user.displayName || "";

            let profileUpdateNeeded = false;
            let emailUpdateNeeded = false;

            // Vérifier si le nom a changé
            if (newDisplayName !== currentDisplayName) {
                profileUpdateNeeded = true;
                console.log("📝 Nom à mettre à jour:", {
                    ancien: currentDisplayName,
                    nouveau: newDisplayName,
                });
            }

            // Vérifier si la photo a changé
            if (profileImage !== user.photoURL) {
                profileUpdateNeeded = true;
                console.log("📸 Photo à mettre à jour:", {
                    ancienne: user.photoURL,
                    nouvelle: profileImage,
                });
            }

            // Vérifier si l'email a changé
            if (formData.email !== user.email) {
                emailUpdateNeeded = true;
                console.log("📧 Email à mettre à jour:", {
                    ancien: user.email,
                    nouveau: formData.email,
                });
            }

            // Mise à jour du profil (nom et photo)
            if (profileUpdateNeeded) {
                console.log("🔄 Mise à jour du profil...");
                const profileSuccess = await updateProfile({
                    displayName: newDisplayName || undefined,
                    photoURL: profileImage || undefined,
                });

                if (!profileSuccess) {
                    throw new Error("Erreur lors de la mise à jour du profil");
                }
                console.log("✅ Profil mis à jour avec succès");
            }

            // Mise à jour de l'email
            if (emailUpdateNeeded) {
                console.log("📧 Mise à jour de l'email...");
                const emailSuccess = await updateEmail(formData.email);

                if (!emailSuccess) {
                    throw new Error("Erreur lors de la mise à jour de l'email");
                }
                console.log("✅ Email mis à jour avec succès");
            }

            // Attendre un peu pour s'assurer que la synchronisation est terminée
            await new Promise((resolve) => setTimeout(resolve, 1000));

            modal.showConfirm(
                "Profil mis à jour ! ✅",
                "Vos modifications ont été enregistrées avec succès ! Voulez-vous retourner à l'accueil ?",
                () => {
                    // Naviguer vers l'accueil avec reset pour nettoyer la pile
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "MainApp" }],
                    });
                },
                () => {
                    console.log(
                        "🔄 Retour à l'écran précédent - synchronisation terminée"
                    );
                    navigation.goBack();
                },
                "Accueil",
                "Continuer"
            );
        } catch (error) {
            console.error("❌ Erreur sauvegarde profil:", error);
            modal.showError(
                "Erreur",
                "Une erreur s'est produite lors de la sauvegarde. Veuillez réessayer."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header avec dégradé */}
            <LinearGradient
                colors={["#7ED957", "#4DA1A9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.headerButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le profil</Text>
                <View style={styles.headerButton} />

                {/* Éléments décoratifs */}
                <View style={styles.headerDecoration}>
                    <View style={styles.floatingElement} />
                    <View
                        style={[
                            styles.floatingElement,
                            styles.floatingElement2,
                        ]}
                    />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Photo de profil dans une carte moderne */}
                <View style={styles.profileImageCard}>
                    <View style={styles.imageContainer}>
                        <View style={styles.avatarGlow}>
                            <Avatar
                                imageUrl={profileImage}
                                size={120}
                                showBorder={true}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.editImageButton}
                            onPress={handleImagePicker}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={["#7ED957", "#4DA1A9"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.editImageButtonGradient}
                            >
                                <Ionicons
                                    name="camera"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.imageHint}>Touchez pour modifier</Text>
                </View>

                {/* Formulaire dans des cartes modernes */}
                <View style={styles.formSection}>
                    {/* Informations personnelles */}
                    <View style={styles.formCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person" size={20} color="#7ED957" />
                            <Text style={styles.cardTitle}>
                                Informations personnelles
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Prénom</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.firstName}
                                    onChangeText={(value) =>
                                        handleInputChange("firstName", value)
                                    }
                                    placeholder="Entrez votre prénom"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nom de famille</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.lastName}
                                    onChangeText={(value) =>
                                        handleInputChange("lastName", value)
                                    }
                                    placeholder="Entrez votre nom de famille"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date de naissance</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="calendar"
                                    size={16}
                                    color="#7ED957"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, styles.inputWithIcon]}
                                    value={formData.birthDate}
                                    onChangeText={(value) =>
                                        handleInputChange("birthDate", value)
                                    }
                                    placeholder="JJ/MM/AAAA"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Contact */}
                    <View style={styles.formCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="mail" size={20} color="#4DA1A9" />
                            <Text style={styles.cardTitle}>Contact</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="mail"
                                    size={16}
                                    color="#4DA1A9"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, styles.inputWithIcon]}
                                    value={formData.email}
                                    onChangeText={(value) =>
                                        handleInputChange("email", value)
                                    }
                                    placeholder="Entrez votre email"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Téléphone</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="call"
                                    size={16}
                                    color="#4DA1A9"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, styles.inputWithIcon]}
                                    value={formData.phone}
                                    onChangeText={(value) =>
                                        handleInputChange("phone", value)
                                    }
                                    placeholder="Entrez votre numéro de téléphone"
                                    placeholderTextColor="#999"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Localisation</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="location"
                                    size={16}
                                    color="#4DA1A9"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, styles.inputWithIcon]}
                                    value={formData.location}
                                    onChangeText={(value) =>
                                        handleInputChange("location", value)
                                    }
                                    placeholder="Entrez votre ville"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.formCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons
                                name="document-text"
                                size={20}
                                color="#FFD93D"
                            />
                            <Text style={styles.cardTitle}>
                                À propos de vous
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.bioContainer,
                                ]}
                            >
                                <TextInput
                                    style={[styles.input, styles.bioInput]}
                                    value={formData.bio}
                                    onChangeText={(value) =>
                                        handleInputChange("bio", value)
                                    }
                                    placeholder="Parlez-nous de vous..."
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    maxLength={200}
                                />
                            </View>
                            <Text style={styles.bioCounter}>
                                {formData.bio.length}/200
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Boutons d'action avec dégradés */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.cancelButtonContainer}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                >
                    <View style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.saveButtonContainer}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={["#7ED957", "#4DA1A9"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.saveButton,
                            isLoading && styles.saveButtonDisabled,
                        ]}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.saveButtonText}>
                                    Enregistrer
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        position: "relative",
        overflow: "hidden",
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    headerDecoration: {
        position: "absolute",
        top: 0,
        right: 0,
        opacity: 0.3,
    },
    floatingElement: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.2)",
        position: "absolute",
        top: -10,
        right: -10,
    },
    floatingElement2: {
        width: 30,
        height: 30,
        borderRadius: 15,
        top: 30,
        right: 20,
    },
    content: {
        flex: 1,
        marginTop: -8,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileImageCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    imageContainer: {
        position: "relative",
        marginBottom: 12,
    },
    avatarGlow: {
        padding: 6,
        borderRadius: 70,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        borderRadius: 20,
        overflow: "hidden",
    },
    editImageButtonGradient: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    imageHint: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    formSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        gap: 16,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
        minHeight: 48,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1A1A1A",
        paddingVertical: 12,
    },
    inputWithIcon: {
        paddingLeft: 0,
    },
    bioContainer: {
        alignItems: "flex-start",
        minHeight: 100,
    },
    bioInput: {
        textAlignVertical: "top",
        paddingTop: 12,
        paddingBottom: 12,
        minHeight: 80,
    },
    bioCounter: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
        marginTop: 4,
    },
    actions: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    cancelButtonContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: "hidden",
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8F9FA",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    saveButtonContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: "hidden",
    },
    saveButton: {
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});

export default EditProfileScreen;
