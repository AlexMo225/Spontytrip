// Palette de couleurs pour SpontyTrip - Design pastel moderne

export const Colors = {
    // Couleurs principales
    primary: "#6B73FF", // Bleu moderne
    primaryLight: "#A8B0FF",
    primaryDark: "#4B51CC",

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
        accent: "#6B73FF",
    },

    // Couleurs fonctionnelles
    success: "#10B981", // Vert succès
    error: "#EF4444", // Rouge erreur
    warning: "#F59E0B", // Orange warning
    info: "#3B82F6", // Bleu info

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
    borderFocus: "#6B73FF",

    // Couleurs d'état des éléments
    pressed: "#F3F4F6",
    hover: "#F9FAFB",
    disabled: "#D1D5DB",

    // Couleurs transparentes
    cardShadow: "rgba(0, 0, 0, 0.08)",
    buttonShadow: "rgba(107, 115, 255, 0.3)",
} as const;

// Alias pour faciliter la transition
export const { backgroundColors } = Colors;
(Colors as any).background = backgroundColors;

// Dégradés
export const Gradients = {
    primary: ["#6B73FF", "#9FE2BF"],
    sunset: ["#FF6B9D", "#FFB3BA"],
    ocean: ["#BAE1FF", "#9FE2BF"],
    lavender: ["#E2CCFF", "#BAE1FF"],
    mint: ["#BAFFC9", "#9FE2BF"],
} as const;

// Couleurs pour les catégories de checklist
export const CategoryColors = {
    transport: "#6B73FF",
    accommodation: "#9FE2BF",
    activities: "#FF6B9D",
    food: "#FFFFBA",
    shopping: "#E2CCFF",
    documents: "#BAE1FF",
    other: "#BAFFC9",
} as const;
