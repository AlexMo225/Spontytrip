export interface PasswordStrength {
    score: number; // 0-4
    isStrong: boolean;
    feedback: string;
}

export const validatePassword = (password: string): PasswordStrength => {
    let score = 0;
    const minLength = 8;
    const feedback: string[] = [];

    // Longueur minimale
    if (password.length < minLength) {
        feedback.push(
            `Le mot de passe doit contenir au moins ${minLength} caractères`
        );
    } else {
        score += 1;
    }

    // Présence de chiffres
    if (/\d/.test(password)) {
        score += 1;
    } else {
        feedback.push("Ajouter des chiffres");
    }

    // Présence de lettres minuscules et majuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push("Ajouter des lettres minuscules et majuscules");
    }

    // Présence de caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
    } else {
        feedback.push("Ajouter des caractères spéciaux");
    }

    return {
        score,
        isStrong: score >= 3,
        feedback:
            feedback.length > 0 ? feedback.join(", ") : "Mot de passe fort",
    };
};

export const getPasswordStrengthColor = (score: number): string => {
    switch (score) {
        case 0:
            return "#FF4444"; // Rouge
        case 1:
            return "#FFA500"; // Orange
        case 2:
            return "#FFD700"; // Jaune
        case 3:
            return "#90EE90"; // Vert clair
        case 4:
            return "#7ED957"; // Vert SpontyTrip
        default:
            return "#DCE0E5"; // Gris par défaut
    }
};

export const getPasswordStrengthLabel = (score: number): string => {
    switch (score) {
        case 0:
            return "Très faible";
        case 1:
            return "Faible";
        case 2:
            return "Moyen";
        case 3:
            return "Fort";
        case 4:
            return "Très fort";
        default:
            return "";
    }
};
