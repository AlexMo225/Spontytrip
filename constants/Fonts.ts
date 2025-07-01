import { TextStyle } from "react-native";

// Configuration des polices pour SpontyTrip

export const FontFamily = {
    heading: "System",
    body: "System",
} as const;

export const FontSize = {
    title1: 32,
    title2: 28,
    title3: 24,
    title4: 20,
    subtitle1: 18,
    subtitle2: 16,
    body1: 16,
    body2: 14,
    body3: 12,
    caption: 11,
    button: 16,
    buttonSmall: 14,
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
    h1: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title1,
        fontWeight: FontWeight.bold,
        family: FontFamily.heading,
    } as TextStyle,
    h2: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title2,
        fontWeight: FontWeight.bold,
        family: FontFamily.heading,
    } as TextStyle,
    h3: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title3,
        fontWeight: FontWeight.semibold,
        family: FontFamily.heading,
    } as TextStyle,
    h4: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title4,
        fontWeight: FontWeight.semibold,
        family: FontFamily.heading,
    } as TextStyle,
    heading: {
        fontFamily: FontFamily.heading,
        fontSize: FontSize.title3,
        fontWeight: FontWeight.semibold,
        family: FontFamily.heading,
    } as TextStyle,
    subtitle1: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.subtitle1,
        fontWeight: FontWeight.semibold,
        family: FontFamily.body,
    } as TextStyle,
    subtitle2: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.subtitle2,
        fontWeight: FontWeight.medium,
        family: FontFamily.body,
    } as TextStyle,
    body1: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.body1,
        fontWeight: FontWeight.normal,
        family: FontFamily.body,
    } as TextStyle,
    body2: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.body2,
        fontWeight: FontWeight.normal,
        family: FontFamily.body,
    } as TextStyle,
    body: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.body1,
        fontWeight: FontWeight.normal,
        family: FontFamily.body,
    } as TextStyle,
    button: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.button,
        fontWeight: FontWeight.semibold,
        family: FontFamily.body,
    } as TextStyle,
    buttonSmall: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.buttonSmall,
        fontWeight: FontWeight.medium,
        family: FontFamily.body,
    } as TextStyle,
    caption: {
        fontFamily: FontFamily.body,
        fontSize: FontSize.caption,
        fontWeight: FontWeight.normal,
        family: FontFamily.body,
    } as TextStyle,
} as const;

// Export pour compatibilité avec le code existant
export const Fonts = {
    heading: {
        family: FontFamily.heading,
        weight: FontWeight.semibold,
    },
    body: {
        family: FontFamily.body,
        weight: FontWeight.normal,
    },
    size: FontSize,
    weight: FontWeight,
    styles: TextStyles,
} as const;
