import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TripCoverImagePickerProps {
    coverImage: string | null;
    handleSelectCoverImage: () => Promise<void>;
    handleRemoveCoverImage: () => void;
}

export const TripCoverImagePicker: React.FC<TripCoverImagePickerProps> = ({
    coverImage,
    handleSelectCoverImage,
    handleRemoveCoverImage,
}) => {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Photo de couverture</Text>

            {coverImage ? (
                <View style={styles.coverImageContainer}>
                    <Image
                        source={{ uri: coverImage }}
                        style={styles.coverImagePreview}
                    />
                    <View style={styles.coverImageOverlay}>
                        <TouchableOpacity
                            style={styles.changeCoverButton}
                            onPress={handleSelectCoverImage}
                        >
                            <Ionicons name="camera" size={20} color="#FFFFFF" />
                            <Text style={styles.changeCoverButtonText}>
                                Changer
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeCoverButton}
                            onPress={handleRemoveCoverImage}
                        >
                            <Ionicons name="trash" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.coverImageSelector}
                    onPress={handleSelectCoverImage}
                >
                    <Ionicons name="camera" size={32} color="#4DA1A9" />
                    <View style={styles.coverImageSelectorTextContainer}>
                        <Text style={styles.coverImageSelectorText}>
                            Ajouter une photo
                        </Text>
                        <Text style={styles.coverImageSelectorSubtext}>
                            Optionnel
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    fieldContainer: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    coverImageContainer: {
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
    },
    coverImagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
    },
    coverImageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 16,
    },
    changeCoverButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    changeCoverButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    removeCoverButton: {
        backgroundColor: "rgba(220, 38, 38, 0.8)",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    coverImageSelector: {
        backgroundColor: "#F8F9FA",
        borderWidth: 2,
        borderColor: "#DBE0E5",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    coverImageSelectorTextContainer: {
        alignItems: "center",
        marginTop: 12,
    },
    coverImageSelectorText: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "600",
        textAlign: "center",
    },
    coverImageSelectorSubtext: {
        fontSize: 14,
        color: "#637887",
        marginTop: 4,
        textAlign: "center",
    },
});
