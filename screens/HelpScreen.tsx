import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

type FAQItem = {
    question: string;
    answer: string;
};

type GuideItem = {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const HelpScreen = () => {
    const insets = useSafeAreaInsets();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqItems: FAQItem[] = [
        {
            question: "Comment créer un nouveau voyage ?",
            answer: "Pour créer un nouveau voyage, appuyez sur le bouton '+' dans l'écran d'accueil. Vous pourrez ensuite définir les dates, la destination et inviter vos amis à rejoindre l'aventure.",
        },
        {
            question: "Comment gérer les dépenses de groupe ?",
            answer: "Dans chaque voyage, accédez à l'onglet 'Dépenses' pour ajouter ou modifier les dépenses. L'application calcule automatiquement qui doit combien à qui, simplifiant les remboursements.",
        },
        {
            question: "Comment inviter des amis à un voyage ?",
            answer: "Dans les détails du voyage, appuyez sur 'Membres' puis sur 'Inviter'. Vous pouvez inviter vos amis par email, SMS ou en partageant un lien direct.",
        },
        {
            question: "Comment modifier mon profil ?",
            answer: "Accédez à votre profil via l'onglet 'Profil', puis appuyez sur 'Modifier le profil'. Vous pourrez changer votre photo, nom et autres informations.",
        },
    ];

    const guides: GuideItem[] = [
        {
            title: "Guide du Voyageur Spontané",
            description:
                "Conseils et astuces pour organiser des voyages improvisés réussis",
            icon: "compass",
        },
        {
            title: "Gestion des Dépenses",
            description:
                "Tout savoir sur le partage des coûts et les remboursements",
            icon: "wallet",
        },
        {
            title: "Planification d'Activités",
            description:
                "Comment organiser des activités de groupe efficacement",
            icon: "calendar",
        },
    ];

    const handleContact = () => {
        Linking.openURL("mailto:support@spontytrip.com");
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Section Recherche d'aide */}
                <View style={[styles.searchSection, { marginTop: insets.top }]}>
                    <Text style={styles.searchTitle}>
                        Comment pouvons-nous vous aider ?
                    </Text>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleContact}
                    >
                        <Ionicons
                            name="search"
                            size={20}
                            color={Colors.text.secondary}
                        />
                        <Text style={styles.searchButtonText}>
                            Rechercher dans l'aide
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Section Guides */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guides Pratiques</Text>
                    <View style={styles.guidesList}>
                        {guides.map((guide, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.guideItem}
                                activeOpacity={0.7}
                            >
                                <View style={styles.guideIcon}>
                                    <Ionicons
                                        name={guide.icon}
                                        size={24}
                                        color={Colors.primary}
                                    />
                                </View>
                                <View style={styles.guideContent}>
                                    <Text style={styles.guideTitle}>
                                        {guide.title}
                                    </Text>
                                    <Text style={styles.guideDescription}>
                                        {guide.description}
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={Colors.text.secondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section FAQ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Questions Fréquentes
                    </Text>
                    <View style={styles.faqList}>
                        {faqItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.faqItem}
                                onPress={() =>
                                    setExpandedFAQ(
                                        expandedFAQ === index ? null : index
                                    )
                                }
                            >
                                <View style={styles.faqHeader}>
                                    <Text style={styles.faqQuestion}>
                                        {item.question}
                                    </Text>
                                    <Ionicons
                                        name={
                                            expandedFAQ === index
                                                ? "chevron-up"
                                                : "chevron-down"
                                        }
                                        size={20}
                                        color={Colors.text.secondary}
                                    />
                                </View>
                                {expandedFAQ === index && (
                                    <Text style={styles.faqAnswer}>
                                        {item.answer}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section Contact */}
                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>
                        Besoin d'aide supplémentaire ?
                    </Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContact}
                    >
                        <Ionicons name="mail" size={20} color={Colors.white} />
                        <Text style={styles.contactButtonText}>
                            Contacter le support
                        </Text>
                    </TouchableOpacity>
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
    searchSection: {
        marginBottom: Spacing.xl,
    },
    searchTitle: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: Spacing.md,
        textAlign: "center",
    },
    searchButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.backgroundColors.secondary,
        padding: Spacing.md,
        borderRadius: 12,
        gap: Spacing.sm,
    },
    searchButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
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
    guidesList: {
        gap: Spacing.md,
    },
    guideItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    guideIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.backgroundColors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.md,
    },
    guideContent: {
        flex: 1,
    },
    guideTitle: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 2,
    },
    guideDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
    },
    faqList: {
        gap: Spacing.md,
    },
    faqItem: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
    },
    faqHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: Spacing.md,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    faqAnswer: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
        padding: Spacing.md,
        paddingTop: 0,
        lineHeight: 20,
    },
    contactSection: {
        alignItems: "center",
        marginTop: Spacing.xl,
    },
    contactTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: 12,
        gap: Spacing.sm,
    },
    contactButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.white,
    },
});

export default HelpScreen;
