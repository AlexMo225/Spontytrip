import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Button from "../components/Button";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { RootStackParamList } from "../types";

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
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "Sophia",
        lastName: "Carter",
        email: "sophia.carter@example.com",
        phone: "+33 6 12 34 56 78",
        bio: "Passionnée de voyages et d'aventures entre amis ! 🌍✈️",
        location: "Paris, France",
        birthDate: "15/03/1995",
    });
    const [profileImage, setProfileImage] = useState(
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
    );

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
            Alert.alert(
                "Permission requise",
                "L'accès à la galerie photo est nécessaire pour changer votre photo de profil."
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

    const handleSave = async () => {
        setIsLoading(true);

        try {
            // Simulation d'une sauvegarde
            await new Promise((resolve) => setTimeout(resolve, 1500));

            Alert.alert(
                "Profil mis à jour",
                "Vos modifications ont été enregistrées avec succès !",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.headerButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le profil</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo de profil */}
                <View style={styles.profileImageSection}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity
                            style={styles.editImageButton}
                            onPress={handleImagePicker}
                        >
                            <Ionicons
                                name="camera"
                                size={20}
                                color={Colors.background}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.imageHint}>Touchez pour modifier</Text>
                </View>

                {/* Formulaire */}
                <View style={styles.form}>
                    {/* Nom */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Prénom</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.firstName}
                            onChangeText={(value) =>
                                handleInputChange("firstName", value)
                            }
                            placeholder="Entrez votre prénom"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    {/* Nom de famille */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nom de famille</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.lastName}
                            onChangeText={(value) =>
                                handleInputChange("lastName", value)
                            }
                            placeholder="Entrez votre nom de famille"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(value) =>
                                handleInputChange("email", value)
                            }
                            placeholder="Entrez votre email"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Téléphone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Téléphone</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(value) =>
                                handleInputChange("phone", value)
                            }
                            placeholder="Entrez votre numéro de téléphone"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Localisation */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Localisation</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.location}
                            onChangeText={(value) =>
                                handleInputChange("location", value)
                            }
                            placeholder="Entrez votre ville"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    {/* Date de naissance */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date de naissance</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.birthDate}
                            onChangeText={(value) =>
                                handleInputChange("birthDate", value)
                            }
                            placeholder="JJ/MM/AAAA"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={formData.bio}
                            onChangeText={(value) =>
                                handleInputChange("bio", value)
                            }
                            placeholder="Parlez-nous de vous..."
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={styles.bioCounter}>
                            {formData.bio.length}/200
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Boutons d'action */}
            <View style={styles.actions}>
                <Button
                    title="Annuler"
                    onPress={handleCancel}
                    variant="outline"
                    style={styles.cancelButton}
                />
                <Button
                    title="Enregistrer"
                    onPress={handleSave}
                    loading={isLoading}
                    style={styles.saveButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    content: {
        flex: 1,
    },
    profileImageSection: {
        alignItems: "center",
        paddingVertical: Spacing.xl,
    },
    imageContainer: {
        position: "relative",
        marginBottom: Spacing.sm,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.lightGray,
    },
    editImageButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: Colors.background,
    },
    imageHint: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
    },
    form: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        fontWeight: "600",
    },
    input: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 48,
    },
    bioInput: {
        minHeight: 100,
        paddingTop: Spacing.sm,
    },
    bioCounter: {
        ...TextStyles.caption,
        color: Colors.textSecondary,
        textAlign: "right",
        marginTop: Spacing.xs,
    },
    actions: {
        flexDirection: "row",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        paddingBottom: Spacing.xl,
        gap: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});

export default EditProfileScreen;
