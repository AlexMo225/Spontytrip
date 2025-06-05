// Configuration des polices pour SpontyTrip

export const FontFamily = {
    // Police pour les titres (Poppins remplace Clash Display)
    heading: "Poppins_600SemiBold",
    headingBold: "Poppins_700Bold",
    headingLight: "Poppins_500Medium",

    // Police pour le texte (Inter remplace Satoshi)
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodySemiBold: "Inter_600SemiBold",
    bodyBold: "Inter_700Bold",

    // Police système par défaut
    system: "System",
} as const;

export const FontSize = {
    // Titres
    title1: 32,
    title2: 28,
    title3: 24,
    title4: 20,

    // Sous-titres
    subtitle1: 18,
    subtitle2: 16,

    // Corps de texte
    body1: 16,
    body2: 14,
    body3: 12,

    // Texte petit
    caption: 11,
    overline: 10,

    // Boutons
    button: 16,
    buttonSmall: 14,

    // Labels
    label: 14,
    labelSmall: 12,
} as const;

export const LineHeight = {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
} as const;

export const FontWeight = {
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
} as const;

// Styles de texte prédéfinis
export const TextStyles = {
    // Titres
    h1: {
        fontFamily: FontFamily.headingBold,
        fontSize: FontSize.title1,
        lineHeight: FontSize.title1 * LineHeight.tight,
    },
    h2: {
        fontFamily: FontFamily.headingBold,
        fontSize: FontSize.title2,
        lineHeight: FontSize.title2 * LineHeight.tight,
    },
    h3: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title3,
        lineHeight: FontSize.title3 * LineHeight.tight,
    },
    h4: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title4,
        lineHeight: FontSize.title4 * LineHeight.normal,
    },

    // Sous-titres
    subtitle1: {
        fontFamily: FontFamily.bodySemiBold,
        fontSize: FontSize.subtitle1,
        lineHeight: FontSize.subtitle1 * LineHeight.normal,
    },
    subtitle2: {
        fontFamily: FontFamily.bodyMedium,
        fontSize: FontSize.subtitle2,
        lineHeight: FontSize.subtitle2 * LineHeight.normal,
    },

    // Corps de texte
    body1: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.body1,
        lineHeight: FontSize.body1 * LineHeight.relaxed,
    },
    body2: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.body2,
        lineHeight: FontSize.body2 * LineHeight.relaxed,
    },

    // Boutons
    button: {
        fontFamily: FontFamily.bodySemiBold,
        fontSize: FontSize.button,
        lineHeight: FontSize.button * LineHeight.normal,
    },
    buttonSmall: {
        fontFamily: FontFamily.bodyMedium,
        fontSize: FontSize.buttonSmall,
        lineHeight: FontSize.buttonSmall * LineHeight.normal,
    },

    // Labels et captions
    caption: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.caption,
        lineHeight: FontSize.caption * LineHeight.normal,
    },
    overline: {
        fontFamily: FontFamily.bodyMedium,
        fontSize: FontSize.overline,
        lineHeight: FontSize.overline * LineHeight.normal,
        textTransform: "uppercase" as const,
        letterSpacing: 1,
    },
} as const;

// Export principal regroupé pour faciliter l'import
export const Fonts = {
    heading: {
        family: FontFamily.heading,
        weight: FontWeight.semibold,
    },
    headingBold: {
        family: FontFamily.headingBold,
        weight: FontWeight.bold,
    },
    body: {
        family: FontFamily.body,
        weight: FontWeight.normal,
    },
    bodyMedium: {
        family: FontFamily.bodyMedium,
        weight: FontWeight.medium,
    },
    bodySemiBold: {
        family: FontFamily.bodySemiBold,
        weight: FontWeight.semibold,
    },
    size: FontSize,
    lineHeight: LineHeight,
    weight: FontWeight,
    styles: TextStyles,
};
