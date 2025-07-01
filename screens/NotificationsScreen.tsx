import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing } from "../constants";

const NotificationsScreen = () => {
    const insets = useSafeAreaInsets();

    // États pour les différents types de notifications
    const [notifications, setNotifications] = useState({
        voyages: true,
        activites: true,
        depenses: true,
        messages: true,
        rappels: false,
        suggestions: true,
        newsletter: false,
    });

    const toggleSwitch = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({
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
                {/* Section Voyages */}
                <View style={[styles.section, { marginTop: insets.top }]}>
                    <Text style={styles.sectionTitle}>Alertes de Voyage</Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Nouveaux voyages
                            </Text>
                            <Text style={styles.optionDescription}>
                                Soyez notifié quand vous êtes invité à un voyage
                            </Text>
                        </View>
                        <Switch
                            value={notifications.voyages}
                            onValueChange={() => toggleSwitch("voyages")}
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
                                Activités de groupe
                            </Text>
                            <Text style={styles.optionDescription}>
                                Notifications des nouvelles activités planifiées
                            </Text>
                        </View>
                        <Switch
                            value={notifications.activites}
                            onValueChange={() => toggleSwitch("activites")}
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
                                Dépenses partagées
                            </Text>
                            <Text style={styles.optionDescription}>
                                Alertes des nouvelles dépenses et remboursements
                            </Text>
                        </View>
                        <Switch
                            value={notifications.depenses}
                            onValueChange={() => toggleSwitch("depenses")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Section Communication */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Communication</Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Messages de groupe
                            </Text>
                            <Text style={styles.optionDescription}>
                                Notifications des nouveaux messages dans les
                                chats
                            </Text>
                        </View>
                        <Switch
                            value={notifications.messages}
                            onValueChange={() => toggleSwitch("messages")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Rappels</Text>
                            <Text style={styles.optionDescription}>
                                Rappels pour les activités et dates importantes
                            </Text>
                        </View>
                        <Switch
                            value={notifications.rappels}
                            onValueChange={() => toggleSwitch("rappels")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Section Découvertes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Découvertes</Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>
                                Suggestions de voyage
                            </Text>
                            <Text style={styles.optionDescription}>
                                Recevez des suggestions personnalisées de
                                destinations
                            </Text>
                        </View>
                        <Switch
                            value={notifications.suggestions}
                            onValueChange={() => toggleSwitch("suggestions")}
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
                                Newsletter SpontyTrip
                            </Text>
                            <Text style={styles.optionDescription}>
                                Actualités et conseils de voyage hebdomadaires
                            </Text>
                        </View>
                        <Switch
                            value={notifications.newsletter}
                            onValueChange={() => toggleSwitch("newsletter")}
                            trackColor={{
                                false: Colors.border,
                                true: Colors.primary,
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Note de confidentialité */}
                <Text style={styles.privacyNote}>
                    Vous pouvez modifier ces paramètres à tout moment. Consultez
                    notre politique de confidentialité pour plus d'informations
                    sur la gestion de vos données.
                </Text>
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
    privacyNote: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: Spacing.md,
    },
});

export default NotificationsScreen;
