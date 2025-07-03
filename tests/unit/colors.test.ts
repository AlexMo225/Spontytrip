import { Colors } from "../../constants/Colors";

describe("Colors Constants", () => {
    describe("Structure des couleurs", () => {
        test("devrait contenir les couleurs principales", () => {
            expect(Colors).toHaveProperty("primary");
            expect(Colors).toHaveProperty("secondary");
            expect(Colors).toHaveProperty("accent");
            expect(Colors).toHaveProperty("white");
            expect(Colors).toHaveProperty("black");
        });

        test("devrait contenir les couleurs de fond", () => {
            expect(Colors).toHaveProperty("background");
            expect(Colors).toHaveProperty("backgroundColors");
            expect(Colors.backgroundColors).toHaveProperty("primary");
            expect(Colors.backgroundColors).toHaveProperty("card");
        });

        test("devrait contenir les couleurs de texte", () => {
            expect(Colors).toHaveProperty("text");
            expect(Colors.text).toHaveProperty("primary");
            expect(Colors.text).toHaveProperty("secondary");
            expect(Colors.text).toHaveProperty("muted");
        });
    });

    describe("Format des couleurs", () => {
        test("les couleurs principales devraient être au format hexadécimal", () => {
            const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

            expect(Colors.primary).toMatch(hexColorRegex);
            expect(Colors.secondary).toMatch(hexColorRegex);
            expect(Colors.accent).toMatch(hexColorRegex);
        });

        test("les couleurs de texte devraient être valides", () => {
            expect(typeof Colors.text.primary).toBe("string");
            expect(typeof Colors.text.secondary).toBe("string");
            expect(Colors.text.primary).toBeTruthy();
            expect(Colors.text.secondary).toBeTruthy();
        });
    });

    describe("Couleurs d'état", () => {
        test("devrait contenir les couleurs fonctionnelles", () => {
            expect(Colors).toHaveProperty("success");
            expect(Colors).toHaveProperty("error");
            expect(Colors).toHaveProperty("warning");
            expect(Colors).toHaveProperty("info");

            expect(typeof Colors.success).toBe("string");
            expect(typeof Colors.error).toBe("string");
            expect(typeof Colors.warning).toBe("string");
            expect(typeof Colors.info).toBe("string");
        });
    });

    describe("Couleurs pastels", () => {
        test("devrait contenir les couleurs pastels", () => {
            const pastelColors = [
                "pastelPink",
                "pastelYellow",
                "pastelBlue",
                "pastelLavender",
                "pastelMint",
            ];

            pastelColors.forEach((color) => {
                expect(Colors).toHaveProperty(color);
                expect(typeof Colors[color]).toBe("string");
                expect(Colors[color]).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });
        });
    });

    describe("Contraste et accessibilité", () => {
        test("la couleur primaire et la couleur de fond devraient être différentes", () => {
            expect(Colors.primary).not.toBe(Colors.backgroundColors.primary);
        });

        test("les couleurs de texte devraient être différentes du fond", () => {
            expect(Colors.text.primary).not.toBe(
                Colors.backgroundColors.primary
            );
            expect(Colors.text.secondary).not.toBe(
                Colors.backgroundColors.primary
            );
        });
    });

    describe("Cohérence des couleurs", () => {
        test("les couleurs hexadécimales principales devraient être valides", () => {
            const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
            const mainColors = [
                Colors.primary,
                Colors.secondary,
                Colors.accent,
                Colors.success,
                Colors.error,
                Colors.warning,
            ];

            mainColors.forEach((color) => {
                expect(color).toMatch(hexColorRegex);
            });
        });

        test("les couleurs d'état devraient avoir des valeurs distinctes", () => {
            const statusColors = [
                Colors.success,
                Colors.error,
                Colors.warning,
                Colors.info,
            ];
            const uniqueColors = new Set(statusColors);
            expect(uniqueColors.size).toBe(statusColors.length);
        });
    });

    describe("Structure des couleurs de fond", () => {
        test("backgroundColors devrait avoir toutes les propriétés nécessaires", () => {
            expect(Colors.backgroundColors).toHaveProperty("primary");
            expect(Colors.backgroundColors).toHaveProperty("secondary");
            expect(Colors.backgroundColors).toHaveProperty("card");
            expect(Colors.backgroundColors).toHaveProperty("overlay");
        });

        test("overlay devrait être en format rgba", () => {
            expect(Colors.backgroundColors.overlay).toMatch(/^rgba\(/);
        });
    });

    describe("Couleurs spécifiques de l'app de voyage", () => {
        test("devrait avoir des couleurs appropriées pour une app de voyage", () => {
            expect(Colors.primary).toBeDefined();
            expect(Colors.secondary).toBeDefined();
            expect(Colors.info).toBeDefined();
        });

        test("devrait avoir des couleurs qui contrastent bien", () => {
            const allStringColors = Object.values(Colors).filter(
                (color) => typeof color === "string"
            );
            const uniqueColors = new Set(allStringColors);
            expect(uniqueColors.size).toBeGreaterThan(10);
        });
    });
});
