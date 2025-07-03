// Palette de couleurs pour SpontyTrip - Design pastel moderne

export const Colors = {
    // Couleurs principales
    primary: "#6366F1", // Bleu-vert moderne
    primaryLight: "#7FBDC3",
    primaryDark: "#3A7A80",

    // Couleurs secondaires pastels
    secondary: "#9FE2BF", // Vert pastel
    secondaryLight: "#C4F0D6",
    secondaryDark: "#7DD3A3",

    // Couleurs neutres
    white: "#FFFFFF",
    lightGray: "#F0F2F5",
    gray: "#E0E4E7",
    darkGray: "#6B7280",
    black: "#1F2937",

    // Pour l'ancien usage (rétrocompatibilité)
    background: "#FAFBFC",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    textWhite: "#FFFFFF",

    // Nouvelle structure organisée
    backgroundColors: {
        primary: "#FAFBFC",
        secondary: "#F0F2F5",
        card: "#FFFFFF",
        overlay: "rgba(0, 0, 0, 0.5)",
    },

    text: {
        primary: "#1F2937",
        secondary: "#6B7280",
        muted: "#9CA3AF",
        white: "#FFFFFF",
        accent: "#4DA1A9",
    },

    // Couleurs fonctionnelles
    success: "#10B981", // Vert succès
    error: "#EF4444", // Rouge erreur
    warning: "#F59E0B", // Orange warning
    info: "#4DA1A9", // Bleu-vert info

    // Couleurs pastels additionnelles
    pastelPink: "#FFB3BA",
    pastelYellow: "#FFFFBA",
    pastelBlue: "#BAE1FF",
    pastelLavender: "#E2CCFF",
    pastelMint: "#BAFFC9",

    // Couleurs d'accent
    accent: "#FF6B9D", // Rose accent
    accentLight: "#FFB3D1",

    // Couleurs des bordures
    border: "#E5E7EB",
    borderFocus: "#4DA1A9",

    // Couleurs d'état des éléments
    pressed: "#F3F4F6",
    hover: "#F9FAFB",
    disabled: "#D1D5DB",

    // Couleurs transparentes
    cardShadow: "rgba(0, 0, 0, 0.08)",
    buttonShadow: "rgba(77, 161, 169, 0.3)", // Ajusté pour le nouveau bleu-vert

    checklistGreen: "#7ED957", // Nouvelle couleur pour la checklist
} as const;

// Alias pour faciliter la transition
export const { backgroundColors } = Colors;
(Colors as any).background = backgroundColors;

// Dégradés
export const Gradients = {
    primary: ["#4DA1A9", "#9FE2BF"],
    sunset: ["#FF6B9D", "#FFB3BA"],
    ocean: ["#BAE1FF", "#9FE2BF"],
    lavender: ["#E2CCFF", "#BAE1FF"],
    mint: ["#BAFFC9", "#9FE2BF"],
} as const;

// Couleurs pour les catégories de checklist
export const CategoryColors = {
    transport: "#4DA1A9",
    accommodation: "#9FE2BF",
    activities: "#FF6B9D",
    food: "#FFFFBA",
    shopping: "#E2CCFF",
    documents: "#BAE1FF",
    other: "#BAFFC9",
} as const;

// 🎨 Couleurs FUN pour la répartition des tâches
export const TaskAssignmentColors = {
    // Couleurs d'avatar pour les membres (rotation automatique)
    memberAvatars: [
        "#FF6B9D", // Rose dynamique
        "#4DA1A9", // Bleu-vert
        "#9FE2BF", // Vert mint
        "#FFB3BA", // Rose pastel
        "#BAE1FF", // Bleu ciel
        "#FFFFBA", // Jaune soleil
        "#E2CCFF", // Lavande
        "#BAFFC9", // Vert lime
        "#FF9F40", // Orange vibrant
        "#9C88FF", // Violet cosmic
    ],

    // Couleurs de progression/gamification
    progress: {
        empty: "#F0F2F5", // Gris clair
        low: "#FFB3BA", // Rose léger
        medium: "#FFFFBA", // Jaune motivant
        high: "#BAFFC9", // Vert succès
        complete: "#10B981", // Vert victoire
    },

    // Couleurs de statut des tâches
    taskStatus: {
        pending: "#F59E0B", // Orange en attente
        accepted: "#4DA1A9", // Bleu-vert accepté
        inProgress: "#8B5CF6", // Violet en cours
        completed: "#10B981", // Vert terminé
        overdue: "#EF4444", // Rouge en retard
    },

    // Couleurs fun pour les badges/récompenses
    badges: {
        gold: "#F59E0B", // Or - Top contributeur
        silver: "#6B7280", // Argent - Bon participaent
        bronze: "#D97706", // Bronze - Débutant
        rainbow: "#9C88FF", // Arc-en-ciel - Polyvalent
        fire: "#FF6B9D", // Feu - Rapide
        star: "#FFFFBA", // Étoile - Régulier
    },

    // Dégradés fun pour les cartes de répartition
    cardGradients: {
        summer: ["#FFB3BA", "#FFFFBA"], // Été
        ocean: ["#BAE1FF", "#9FE2BF"], // Océan
        sunset: ["#FF6B9D", "#E2CCFF"], // Coucher de soleil
        forest: ["#BAFFC9", "#9FE2BF"], // Forêt
        cosmic: ["#E2CCFF", "#9C88FF"], // Cosmique
        energy: ["#4DA1A9", "#9FE2BF"], // Énergie
    },
} as const;
