// Système de spacing pour SpontyTrip - Design cohérent

export const Spacing = {
    // Spacing de base (multiple de 4)
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
    xxxxxl: 48,

    // Aliases pour faciliter l'usage
    small: 8,
    medium: 16,
    large: 24,

    // Spacing spécifiques
    screenPadding: 20,
    cardPadding: 16,
    buttonPadding: 12,
    inputPadding: 16,

    // Margins
    sectionMargin: 24,
    componentMargin: 16,
    elementMargin: 8,

    // Spacing verticaux
    headerHeight: 60,
    tabBarHeight: 80,
    buttonHeight: 48,
    buttonSmallHeight: 36,
    inputHeight: 48,

    // Radius
    borderRadius: {
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        xxl: 20,
        round: 50,
    },

    // Shadows
    shadow: {
        small: {
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        medium: {
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        large: {
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
        },
    },
} as const;

// Layout helpers
export const Layout = {
    window: {
        width: "100%",
        height: "100%",
    },
    container: {
        flex: 1,
        paddingHorizontal: Spacing.screenPadding,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        flexDirection: "row" as const,
        alignItems: "center",
    },
    column: {
        flexDirection: "column" as const,
    },
} as const;
