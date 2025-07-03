import {
    getPasswordStrengthColor,
    getPasswordStrengthLabel,
    PasswordStrength,
    validatePassword,
} from "../../utils/passwordUtils";

describe("passwordUtils", () => {
    describe("validatePassword", () => {
        it("devrait retourner un score de 0 pour un mot de passe très faible", () => {
            const result: PasswordStrength = validatePassword("abc");

            expect(result.score).toBe(0);
            expect(result.isStrong).toBe(false);
            expect(result.feedback).toContain("au moins 8 caractères");
        });

        it("devrait retourner un score de 1 pour un mot de passe avec seulement la longueur", () => {
            const result: PasswordStrength = validatePassword("12345678");

            expect(result.score).toBe(2); // longueur + chiffres
            expect(result.isStrong).toBe(false);
            expect(result.feedback).toContain(
                "lettres minuscules et majuscules"
            );
        });

        it("devrait retourner un score de 3 pour un mot de passe fort", () => {
            const result: PasswordStrength = validatePassword("Password123");

            expect(result.score).toBe(3);
            expect(result.isStrong).toBe(true);
            expect(result.feedback).toContain("caractères spéciaux");
        });

        it("devrait retourner un score de 4 pour un mot de passe très fort", () => {
            const result: PasswordStrength = validatePassword("Password123!");

            expect(result.score).toBe(4);
            expect(result.isStrong).toBe(true);
            expect(result.feedback).toBe("Mot de passe fort");
        });

        it("devrait détecter la présence de chiffres", () => {
            const withNumbers = validatePassword("abcdefgh1");
            const withoutNumbers = validatePassword("abcdefgh");

            expect(withNumbers.score).toBeGreaterThan(withoutNumbers.score);
        });

        it("devrait détecter la présence de minuscules et majuscules", () => {
            const mixedCase = validatePassword("AbCdEfGh");
            const lowerCase = validatePassword("abcdefgh");

            expect(mixedCase.score).toBeGreaterThan(lowerCase.score);
        });

        it("devrait détecter la présence de caractères spéciaux", () => {
            const withSpecial = validatePassword("Password!");
            const withoutSpecial = validatePassword("Password");

            expect(withSpecial.score).toBeGreaterThan(withoutSpecial.score);
        });

        it("devrait gérer les mots de passe vides", () => {
            const result: PasswordStrength = validatePassword("");

            expect(result.score).toBe(0);
            expect(result.isStrong).toBe(false);
            expect(result.feedback).toContain("au moins 8 caractères");
        });
    });

    describe("getPasswordStrengthColor", () => {
        it("devrait retourner les bonnes couleurs pour chaque score", () => {
            expect(getPasswordStrengthColor(0)).toBe("#FF4444"); // Rouge
            expect(getPasswordStrengthColor(1)).toBe("#FFA500"); // Orange
            expect(getPasswordStrengthColor(2)).toBe("#FFD700"); // Jaune
            expect(getPasswordStrengthColor(3)).toBe("#90EE90"); // Vert clair
            expect(getPasswordStrengthColor(4)).toBe("#7ED957"); // Vert SpontyTrip
        });

        it("devrait retourner une couleur par défaut pour un score invalide", () => {
            expect(getPasswordStrengthColor(-1)).toBe("#DCE0E5");
            expect(getPasswordStrengthColor(5)).toBe("#DCE0E5");
        });
    });

    describe("getPasswordStrengthLabel", () => {
        it("devrait retourner les bons labels pour chaque score", () => {
            expect(getPasswordStrengthLabel(0)).toBe("Très faible");
            expect(getPasswordStrengthLabel(1)).toBe("Faible");
            expect(getPasswordStrengthLabel(2)).toBe("Moyen");
            expect(getPasswordStrengthLabel(3)).toBe("Fort");
            expect(getPasswordStrengthLabel(4)).toBe("Très fort");
        });

        it("devrait retourner une chaîne vide pour un score invalide", () => {
            expect(getPasswordStrengthLabel(-1)).toBe("");
            expect(getPasswordStrengthLabel(5)).toBe("");
        });
    });

    describe("Scénarios d'intégration", () => {
        it("devrait valider un mot de passe complexe réel", () => {
            const complexPassword = "MyTr1p2024!@";
            const result = validatePassword(complexPassword);

            expect(result.score).toBe(4);
            expect(result.isStrong).toBe(true);
            expect(result.feedback).toBe("Mot de passe fort");
            expect(getPasswordStrengthColor(result.score)).toBe("#7ED957");
            expect(getPasswordStrengthLabel(result.score)).toBe("Très fort");
        });

        it("devrait identifier les faiblesses d'un mot de passe couramment utilisé", () => {
            const commonPassword = "password";
            const result = validatePassword(commonPassword);

            expect(result.score).toBe(1);
            expect(result.isStrong).toBe(false);
            expect(result.feedback).toContain("chiffres");
            expect(result.feedback).toContain("majuscules");
            expect(result.feedback).toContain("caractères spéciaux");
        });
    });
});
