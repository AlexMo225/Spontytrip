import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { AuthService, AuthUser } from "../services/authService";
import FirebaseServiceInstance from "../services/firebaseService";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isNewUser: boolean;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (
        email: string,
        password: string,
        displayName?: string
    ) => Promise<boolean>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<boolean>;
    updateProfile: (updates: {
        displayName?: string;
        photoURL?: string;
    }) => Promise<boolean>;
    updateEmail: (newEmail: string) => Promise<boolean>;
    updatePassword: (newPassword: string) => Promise<boolean>;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
    markUserAsExisting: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    // Fonction pour forcer le rechargement des données utilisateur
    const refreshUser = async () => {
        try {
            const currentUser = await AuthService.reloadCurrentUser();
            console.log(
                "🔄 Rechargement forcé des données utilisateur:",
                currentUser
            );
            setUser(currentUser);
        } catch (error) {
            console.error("Erreur lors du rechargement utilisateur:", error);
        }
    };

    useEffect(() => {
        // Écouter les changements d'état d'authentification
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
            console.log(
                "👤 État auth changé:",
                user
                    ? `Connecté: ${user.email} (${user.displayName})`
                    : "Déconnecté"
            );

            // Si un utilisateur est connecté mais n'a pas de displayName,
            // essayer de recharger ses données
            if (user && !user.displayName) {
                console.log(
                    "⚠️ Utilisateur sans displayName détecté, rechargement..."
                );
                setTimeout(async () => {
                    await refreshUser();
                }, 1000);
            }

            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (
        email: string,
        password: string
    ): Promise<boolean> => {
        try {
            const result = await AuthService.signIn(email, password);
            if (result.success) {
                setIsNewUser(false);
            }
            return result.success;
        } catch (error) {
            console.error("Erreur connexion:", error);
            return false;
        }
    };

    const signUp = async (
        email: string,
        password: string,
        displayName?: string
    ): Promise<boolean> => {
        try {
            const result = await AuthService.signUp(
                email,
                password,
                displayName
            );
            if (result.success) {
                console.log(
                    "✅ Inscription réussie, marquage comme nouvel utilisateur"
                );
                setIsNewUser(true);

                setTimeout(() => {
                    console.log("🔄 Synchronisation post-inscription terminée");
                }, 2000);
            }
            return result.success;
        } catch (error) {
            console.error("Erreur inscription:", error);
            return false;
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            await AuthService.signOut();
            setIsNewUser(false);
        } catch (error) {
            console.error("Erreur déconnexion:", error);
        }
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        try {
            const result = await AuthService.resetPassword(email);
            return result.success;
        } catch (error) {
            console.error("Erreur reset password:", error);
            return false;
        }
    };

    const updateProfile = async (updates: {
        displayName?: string;
        photoURL?: string;
    }): Promise<boolean> => {
        try {
            const result = await AuthService.updateProfile(updates);
            if (result.success) {
                // Forcer la synchronisation après mise à jour
                await refreshUser();
                console.log("✅ Profil mis à jour et synchronisé");
            }
            return result.success;
        } catch (error) {
            console.error("Erreur mise à jour du profil:", error);
            return false;
        }
    };

    const updateEmail = async (newEmail: string): Promise<boolean> => {
        try {
            const result = await AuthService.updateEmail(newEmail);
            if (result.success) {
                // Forcer la synchronisation après mise à jour
                await refreshUser();
                console.log("✅ Email mis à jour et synchronisé");
            }
            return result.success;
        } catch (error) {
            console.error("Erreur mise à jour de l'email:", error);
            return false;
        }
    };

    const updatePassword = async (newPassword: string): Promise<boolean> => {
        try {
            const result = await AuthService.updatePassword(newPassword);
            return result.success;
        } catch (error) {
            console.error("Erreur mise à jour du mot de passe:", error);
            return false;
        }
    };

    const deleteAccount = async (): Promise<{
        success: boolean;
        error?: string;
    }> => {
        try {
            if (!user) {
                return {
                    success: false,
                    error: "Aucun utilisateur connecté",
                };
            }

            console.log("🗑️ Début de la suppression du compte:", user.uid);

            // 1. Supprimer toutes les données Firestore de l'utilisateur
            await FirebaseServiceInstance.deleteUserData(user.uid);

            // 2. Supprimer le compte Firebase Auth
            const result = await AuthService.deleteAccount();

            if (result.success) {
                console.log("✅ Compte supprimé avec succès");
                setIsNewUser(false);
                // Le listener onAuthStateChanged se chargera de mettre à jour l'état
                return { success: true };
            } else {
                return {
                    success: false,
                    error:
                        result.error ||
                        "Erreur lors de la suppression du compte",
                };
            }
        } catch (error) {
            console.error("❌ Erreur suppression compte:", error);
            return {
                success: false,
                error: "Une erreur inattendue s'est produite",
            };
        }
    };

    const markUserAsExisting = () => {
        console.log("👤 Utilisateur marqué comme existant");
        setIsNewUser(false);
    };

    const value: AuthContextType = {
        user,
        loading,
        isNewUser,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        updateEmail,
        updatePassword,
        deleteAccount,
        markUserAsExisting,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
