import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing } from "../constants";

const PrivacyScreen = () => {
    const insets = useSafeAreaInsets();

    // États pour les paramètres de confidentialité
    const [privacy, setPrivacy] = useState({
        profilPublic: false,
        localisation: true,
        voyagesPublics: false,
        photosPubliques: false,
        depensesVisibles: true,
        statistiquesPubliques: true,
        partageContacts: false,
    });

    const toggleSwitch = (key: keyof typeof privacy) => {
        setPrivacy((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Section Profil */}
                <View style={[styles.section, { marginTop: insets.top }]}>
                    <Text style={styles.sectionTitle}>
                        Visibilité du Profil
                    </Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Profil public
                            </Text>
                            <Text style={styles.optionDescription}>
                                Permettre aux autres utilisateurs de voir votre
                                profil
                            </Text>
                        </View>
                        <Switch
                            value={privacy.profilPublic}
                            onValueChange={() => toggleSwitch("profilPublic")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Partage de localisation
                            </Text>
                            <Text style={styles.optionDescription}>
                                Visible uniquement pendant les voyages actifs
                            </Text>
                        </View>
                        <Switch
                            value={privacy.localisation}
                            onValueChange={() => toggleSwitch("localisation")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Section Voyages */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Paramètres des Voyages
                    </Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Voyages publics
                            </Text>
                            <Text style={styles.optionDescription}>
                                Rendre vos voyages visibles dans le fil
                                d'actualité
                            </Text>
                        </View>
                        <Switch
                            value={privacy.voyagesPublics}
                            onValueChange={() => toggleSwitch("voyagesPublics")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Photos partagées
                            </Text>
                            <Text style={styles.optionDescription}>
                                Autoriser le partage public de vos photos de
                                voyage
                            </Text>
                        </View>
                        <Switch
                            value={privacy.photosPubliques}
                            onValueChange={() =>
                                toggleSwitch("photosPubliques")
                            }
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Section Données */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Données et Statistiques
                    </Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Dépenses de groupe
                            </Text>
                            <Text style={styles.optionDescription}>
                                Visibles uniquement par les membres du voyage
                            </Text>
                        </View>
                        <Switch
                            value={privacy.depensesVisibles}
                            onValueChange={() =>
                                toggleSwitch("depensesVisibles")
                            }
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Statistiques de voyage
                            </Text>
                            <Text style={styles.optionDescription}>
                                Partager vos statistiques dans votre profil
                                public
                            </Text>
                        </View>
                        <Switch
                            value={privacy.statistiquesPubliques}
                            onValueChange={() =>
                                toggleSwitch("statistiquesPubliques")
                            }
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Section Contacts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Contacts et Invitations
                    </Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Synchronisation contacts
                            </Text>
                            <Text style={styles.optionDescription}>
                                Trouver des amis via votre carnet d'adresses
                            </Text>
                        </View>
                        <Switch
                            value={privacy.partageContacts}
                            onValueChange={() =>
                                toggleSwitch("partageContacts")
                            }
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Note de confidentialité */}
                <TouchableOpacity style={styles.policyLink}>
                    <Text style={styles.policyText}>
                        Consulter la politique de confidentialité complète
                    </Text>
                    <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={Colors.primary}
                    />
                </TouchableOpacity>
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
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    optionInfo: {
        flex: 1,
        marginRight: Spacing.md,
    },
    optionTitle: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
    },
    policyLink: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.md,
        gap: Spacing.xs,
    },
    policyText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.primary,
        textDecorationLine: "underline",
    },
});

export default PrivacyScreen;
