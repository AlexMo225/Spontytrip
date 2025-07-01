import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing } from "../constants";

const AboutScreen = () => {
    const insets = useSafeAreaInsets();

    const handleWebsite = () => {
        Linking.openURL("https://spontytrip.com");
    };

    const handleInstagram = () => {
        Linking.openURL("https://instagram.com/spontytrip");
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Section Mission */}
                <View style={[styles.section, { marginTop: insets.top }]}>
                    <Text style={styles.sectionTitle}>Notre Mission</Text>
                    <Text style={styles.sectionText}>
                        SpontyTrip est né d'une vision simple : rendre les
                        voyages spontanés plus accessibles et mémorables. Nous
                        croyons que les meilleures aventures sont souvent non
                        planifiées, et notre application est conçue pour
                        faciliter ces moments magiques.
                    </Text>
                </View>

                {/* Section Fonctionnalités */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Fonctionnalités Clés
                    </Text>
                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Ionicons
                                name="map"
                                size={24}
                                color={Colors.primary}
                            />
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>
                                    Planification Spontanée
                                </Text>
                                <Text style={styles.featureDescription}>
                                    Découvrez des destinations et activités
                                    adaptées à vos envies du moment
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Ionicons
                                name="people"
                                size={24}
                                color={Colors.primary}
                            />
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>
                                    Voyages de Groupe
                                </Text>
                                <Text style={styles.featureDescription}>
                                    Organisez et partagez facilement vos
                                    aventures avec vos amis
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Ionicons
                                name="wallet"
                                size={24}
                                color={Colors.primary}
                            />
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>
                                    Gestion des Dépenses
                                </Text>
                                <Text style={styles.featureDescription}>
                                    Suivez et partagez les dépenses du groupe en
                                    toute simplicité
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section Version */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Informations Techniques
                    </Text>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>2.1.0</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Dernière mise à jour
                        </Text>
                        <Text style={styles.infoValue}>01 Juillet 2025</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Développé par</Text>
                        <Text style={styles.infoValue}>Équipe SpontyTrip</Text>
                    </View>
                </View>

                {/* Section Liens */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nous Suivre</Text>
                    <View style={styles.socialLinks}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleWebsite}
                        >
                            <Ionicons
                                name="globe"
                                size={24}
                                color={Colors.white}
                            />
                            <Text style={styles.socialButtonText}>
                                Site Web
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.socialButton,
                                { backgroundColor: "#E1306C" },
                            ]}
                            onPress={handleInstagram}
                        >
                            <Ionicons
                                name="logo-instagram"
                                size={24}
                                color={Colors.white}
                            />
                            <Text style={styles.socialButtonText}>
                                Instagram
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    sectionText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    featureList: {
        gap: Spacing.md,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.backgroundColors.secondary,
        padding: Spacing.md,
        borderRadius: 12,
    },
    featureText: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
    },
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoLabel: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
    },
    infoValue: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: Colors.text.primary,
    },
    socialLinks: {
        flexDirection: "row",
        gap: Spacing.md,
    },
    socialButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 12,
        gap: Spacing.sm,
    },
    socialButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
    },
});

export default AboutScreen;
