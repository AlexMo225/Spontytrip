import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants";

const PreferencesScreen = () => {
    const insets = useSafeAreaInsets();

    // États pour les préférences de voyage
    const [preferences, setPreferences] = useState({
        aventurier: true,
        culturel: true,
        gastronomique: false,
        detente: false,
        sport: true,
        nature: true,
        urbain: false,
        budget: "moyen",
        dureePreferee: "weekend",
    });

    const toggleSwitch = (key: keyof typeof preferences) => {
        if (typeof preferences[key] === "boolean") {
            setPreferences((prev) => ({
                ...prev,
                [key]: !prev[key],
            }));
        }
    };

    return (
        <View style={styles.container}>
            {/* Header avec dégradé */}
            <LinearGradient
                colors={["#F59E0B", "#4DA1A9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <Text style={styles.headerTitle}>Préférences</Text>
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
                {/* Section Types de Voyage */}
                <View style={styles.preferencesCard}>
                    <Text style={styles.sectionTitle}>Types de Voyage</Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View
                                style={[
                                    styles.optionIcon,
                                    {
                                        backgroundColor:
                                            "rgba(245, 158, 11, 0.15)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="compass"
                                    size={22}
                                    color="#F59E0B"
                                />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>
                                    Aventurier
                                </Text>
                                <Text style={styles.optionDescription}>
                                    Voyages hors des sentiers battus
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={preferences.aventurier}
                            onValueChange={() => toggleSwitch("aventurier")}
                            trackColor={{
                                false: Colors.border,
                                true: "#F59E0B",
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionSeparator} />

                    <View style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View
                                style={[
                                    styles.optionIcon,
                                    {
                                        backgroundColor:
                                            "rgba(99, 102, 241, 0.15)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="library"
                                    size={22}
                                    color="#6366F1"
                                />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>Culturel</Text>
                                <Text style={styles.optionDescription}>
                                    Musées, sites historiques et patrimoine
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={preferences.culturel}
                            onValueChange={() => toggleSwitch("culturel")}
                            trackColor={{
                                false: Colors.border,
                                true: "#6366F1",
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionSeparator} />

                    <View style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View
                                style={[
                                    styles.optionIcon,
                                    {
                                        backgroundColor:
                                            "rgba(126, 217, 87, 0.15)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="restaurant"
                                    size={22}
                                    color="#7ED957"
                                />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>
                                    Gastronomique
                                </Text>
                                <Text style={styles.optionDescription}>
                                    Découverte des cuisines locales
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={preferences.gastronomique}
                            onValueChange={() => toggleSwitch("gastronomique")}
                            trackColor={{
                                false: Colors.border,
                                true: "#7ED957",
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Section Activités */}
                <View style={styles.preferencesCard}>
                    <Text style={styles.sectionTitle}>Activités Préférées</Text>

                    <View style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View
                                style={[
                                    styles.optionIcon,
                                    {
                                        backgroundColor:
                                            "rgba(239, 68, 68, 0.15)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="bicycle"
                                    size={22}
                                    color="#EF4444"
                                />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>
                                    Sport & Aventure
                                </Text>
                                <Text style={styles.optionDescription}>
                                    Randonnée, escalade, sports nautiques
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={preferences.sport}
                            onValueChange={() => toggleSwitch("sport")}
                            trackColor={{
                                false: Colors.border,
                                true: "#EF4444",
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionSeparator} />

                    <View style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View
                                style={[
                                    styles.optionIcon,
                                    {
                                        backgroundColor:
                                            "rgba(16, 185, 129, 0.15)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="leaf"
                                    size={22}
                                    color="#10B981"
                                />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>Nature</Text>
                                <Text style={styles.optionDescription}>
                                    Parcs nationaux, observation de la faune
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={preferences.nature}
                            onValueChange={() => toggleSwitch("nature")}
                            trackColor={{
                                false: Colors.border,
                                true: "#10B981",
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.optionSeparator} />

                    <View style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <View
                                style={[
                                    styles.optionIcon,
                                    {
                                        backgroundColor:
                                            "rgba(139, 92, 246, 0.15)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="business"
                                    size={22}
                                    color="#8B5CF6"
                                />
                            </View>
                            <View>
                                <Text style={styles.optionTitle}>Urbain</Text>
                                <Text style={styles.optionDescription}>
                                    Vie nocturne, shopping, art urbain
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={preferences.urbain}
                            onValueChange={() => toggleSwitch("urbain")}
                            trackColor={{
                                false: Colors.border,
                                true: "#8B5CF6",
                            }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        position: "relative",
        overflow: "hidden",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily: Fonts.heading.family,
        textShadowColor: "rgba(0, 0, 0, 0.1)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerDecoration: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    floatingElement: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        top: 20,
        right: 30,
    },
    floatingElement2: {
        width: 120,
        height: 120,
        borderRadius: 60,
        top: -20,
        left: 20,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    content: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    preferencesCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: 20,
        fontFamily: Fonts.heading.family,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 16,
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
        fontFamily: Fonts.body.family,
    },
    optionDescription: {
        fontSize: 14,
        color: Colors.text.secondary,
        fontFamily: Fonts.body.family,
    },
    optionSeparator: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
});

export default PreferencesScreen;
