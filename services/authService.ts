import firebase from "firebase/app";
import { auth } from "../config/firebase";

// Types personnalisés
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt?: Date;
}

export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

// Conversion User Firebase vers AuthUser
const convertFirebaseUser = (user: firebase.User): AuthUser => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: user.metadata?.creationTime
        ? new Date(user.metadata.creationTime)
        : undefined,
});

// Gestion des erreurs Firebase
const getErrorMessage = (error: any): string => {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "Cette adresse email est déjà utilisée.";
        case "auth/weak-password":
            return "Le mot de passe doit contenir au moins 6 caractères.";
        case "auth/invalid-email":
            return "L'adresse email saisie n'est pas valide.";
        case "auth/user-not-found":
            return "Aucun compte n'existe avec cette adresse email.";
        case "auth/wrong-password":
            return "Le mot de passe saisi est incorrect.";
        case "auth/invalid-login-credentials":
            return "Email ou mot de passe incorrect.";
        case "auth/user-disabled":
            return "Ce compte a été désactivé.";
        case "auth/too-many-requests":
            return "Trop de tentatives de connexion. Réessayez dans quelques minutes.";
        case "auth/network-request-failed":
            return "Erreur de connexion. Vérifiez votre connexion internet.";
        case "auth/operation-not-allowed":
            return "Cette méthode de connexion n'est pas autorisée.";
        case "auth/requires-recent-login":
            return "Veuillez vous reconnecter pour effectuer cette action.";
        case "auth/user-token-expired":
            return "Votre session a expiré. Veuillez vous reconnecter.";
        default:
            return "Email ou mot de passe incorrect.";
    }
};

// Service d'authentification
export class AuthService {
    // Inscription
    static async signUp(
        email: string,
        password: string,
        displayName?: string
    ): Promise<AuthResult> {
        try {
            console.log(
                "📝 Inscription en cours avec displayName:",
                displayName
            );

            const userCredential = await auth.createUserWithEmailAndPassword(
                email,
                password
            );

            // Mise à jour du profil si un nom est fourni
            if (displayName && userCredential.user) {
                console.log("🔄 Mise à jour du profil utilisateur...");

                // Première mise à jour du profil
                await userCredential.user.updateProfile({ displayName });

                // Forcer le rechargement des données utilisateur
                await userCredential.user.reload();

                // Attendre un peu pour s'assurer que Firebase a propagé les changements
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Recharger encore une fois pour être sûr
                await userCredential.user.reload();

                console.log("✅ Profil mis à jour:", {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                });

                // Vérifier que le displayName a bien été sauvegardé
                if (!userCredential.user.displayName) {
                    console.warn(
                        "⚠️ DisplayName non sauvegardé, nouvelle tentative..."
                    );
                    await userCredential.user.updateProfile({ displayName });
                    await userCredential.user.reload();
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }

            const finalUser = convertFirebaseUser(userCredential.user!);
            console.log("👤 Utilisateur final créé:", finalUser);

            return {
                success: true,
                user: finalUser,
            };
        } catch (error) {
            console.error("❌ Erreur lors de l'inscription:", error);
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }

    // Connexion
    static async signIn(email: string, password: string): Promise<AuthResult> {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(
                email,
                password
            );
            return {
                success: true,
                user: convertFirebaseUser(userCredential.user!),
            };
        } catch (error) {
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }

    // Déconnexion
    static async signOut(): Promise<AuthResult> {
        try {
            console.log("🔄 AuthService.signOut() - Début de la déconnexion");
            await auth.signOut();
            console.log(
                "✅ AuthService.signOut() - Déconnexion Firebase réussie"
            );
            return { success: true };
        } catch (error) {
            console.error("❌ AuthService.signOut() - Erreur Firebase:", error);
            return {
                success: false,
                error: "Erreur lors de la déconnexion.",
            };
        }
    }

    // Réinitialisation du mot de passe
    static async resetPassword(email: string): Promise<AuthResult> {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }

    // Écouter les changements d'état d'authentification
    static onAuthStateChanged(callback: (user: AuthUser | null) => void) {
        return auth.onAuthStateChanged((user) => {
            callback(user ? convertFirebaseUser(user) : null);
        });
    }

    // Obtenir l'utilisateur actuel
    static getCurrentUser(): AuthUser | null {
        const user = auth.currentUser;
        if (user) {
            console.log("📋 Données utilisateur actuelles:", {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
            });
        }
        return user ? convertFirebaseUser(user) : null;
    }

    // Forcer le rechargement de l'utilisateur actuel
    static async reloadCurrentUser(): Promise<AuthUser | null> {
        try {
            const user = auth.currentUser;
            if (user) {
                console.log("🔄 Rechargement forcé de l'utilisateur...");
                await user.reload();
                const reloadedUser = convertFirebaseUser(user);
                console.log("✅ Utilisateur rechargé:", reloadedUser);
                return reloadedUser;
            }
            return null;
        } catch (error) {
            console.error("❌ Erreur lors du rechargement utilisateur:", error);
            return null;
        }
    }

    // Mettre à jour le profil utilisateur
    static async updateProfile(updates: {
        displayName?: string;
        photoURL?: string;
    }): Promise<AuthResult> {
        try {
            const user = auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: "Aucun utilisateur connecté",
                };
            }

            await user.updateProfile(updates);
            await user.reload();

            return {
                success: true,
                user: convertFirebaseUser(user),
            };
        } catch (error) {
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }

    // Mettre à jour l'email
    static async updateEmail(newEmail: string): Promise<AuthResult> {
        try {
            const user = auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: "Aucun utilisateur connecté",
                };
            }

            await user.updateEmail(newEmail);
            await user.reload();

            return {
                success: true,
                user: convertFirebaseUser(user),
            };
        } catch (error) {
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }

    // Mettre à jour le mot de passe
    static async updatePassword(newPassword: string): Promise<AuthResult> {
        try {
            const user = auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: "Aucun utilisateur connecté",
                };
            }

            await user.updatePassword(newPassword);

            return {
                success: true,
                user: convertFirebaseUser(user),
            };
        } catch (error) {
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }

    // Supprimer le compte utilisateur (conforme RGPD)
    static async deleteAccount(): Promise<AuthResult> {
        try {
            const user = auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: "Aucun utilisateur connecté",
                };
            }

            console.log("🗑️ Suppression du compte utilisateur:", user.uid);

            // Supprimer le compte Firebase Auth
            await user.delete();

            console.log("✅ Compte utilisateur supprimé avec succès");

            return {
                success: true,
            };
        } catch (error) {
            console.error("❌ Erreur lors de la suppression du compte:", error);
            return {
                success: false,
                error: getErrorMessage(error),
            };
        }
    }
}
