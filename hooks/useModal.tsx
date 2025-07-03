import React, { createContext, ReactNode, useContext, useState } from "react";
import SpontyModal, { ModalButton, ModalType } from "../components/SpontyModal";

interface ModalConfig {
    type: ModalType;
    title: string;
    message?: string;
    buttons: ModalButton[];
    autoCloseDelay?: number;
    hideIcon?: boolean;
}

interface ModalContextType {
    showModal: (config: ModalConfig) => void;
    hideModal: () => void;
    // Méthodes de commodité
    showSuccess: (
        title: string,
        message?: string,
        autoClose?: boolean,
        customDelay?: number
    ) => void;
    showError: (title: string, message?: string) => void;
    showWarning: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string, autoClose?: boolean) => void;
    showConfirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText?: string,
        cancelText?: string
    ) => void;
    showDelete: (
        title: string,
        message: string,
        onDelete: () => void,
        onCancel?: () => void
    ) => void;
    // Nouvelle méthode avec délai pour iOS
    showSuccessDelayed: (
        title: string,
        message?: string,
        delay?: number
    ) => void;
    showErrorDelayed: (title: string, message?: string, delay?: number) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
    const [visible, setVisible] = useState(false);

    const showModal = (config: ModalConfig) => {
        setModalConfig(config);
        setVisible(true);
    };

    const hideModal = () => {
        setVisible(false);
        // Délai pour laisser l'animation se terminer
        setTimeout(() => {
            setModalConfig(null);
        }, 300);
    };

    const showSuccess = (
        title: string,
        message?: string,
        autoClose: boolean = true,
        customDelay?: number
    ) => {
        showModal({
            type: "success",
            title,
            message,
            buttons: [
                {
                    text: "OK",
                    onPress: () => {},
                    primary: true,
                },
            ],
            autoCloseDelay: autoClose ? customDelay || 2500 : undefined,
        });
    };

    const showError = (title: string, message?: string) => {
        showModal({
            type: "error",
            title,
            message,
            buttons: [
                {
                    text: "OK",
                    onPress: () => {},
                    primary: true,
                },
            ],
        });
    };

    const showWarning = (title: string, message?: string) => {
        showModal({
            type: "warning",
            title,
            message,
            buttons: [
                {
                    text: "OK",
                    onPress: () => {},
                    primary: true,
                },
            ],
        });
    };

    const showInfo = (
        title: string,
        message?: string,
        autoClose: boolean = true
    ) => {
        showModal({
            type: "info",
            title,
            message,
            buttons: [
                {
                    text: "OK",
                    onPress: () => {},
                    primary: true,
                },
            ],
            autoCloseDelay: autoClose ? 3000 : undefined,
        });
    };

    const showConfirm = (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText: string = "Confirmer",
        cancelText: string = "Annuler"
    ) => {
        showModal({
            type: "confirm",
            title,
            message,
            buttons: [
                {
                    text: cancelText,
                    onPress: onCancel || (() => {}),
                    style: "cancel",
                },
                {
                    text: confirmText,
                    onPress: onConfirm,
                    primary: true,
                },
            ],
        });
    };

    const showDelete = (
        title: string,
        message: string,
        onDelete: () => void,
        onCancel?: () => void
    ) => {
        showModal({
            type: "warning",
            title,
            message,
            buttons: [
                {
                    text: "Annuler",
                    onPress: onCancel || (() => {}),
                    style: "cancel",
                },
                {
                    text: "Supprimer",
                    onPress: onDelete,
                    style: "destructive",
                    primary: true,
                },
            ],
        });
    };

    // Nouvelles méthodes avec délai pour iOS
    const showSuccessDelayed = (
        title: string,
        message?: string,
        delay: number = 500
    ) => {
        setTimeout(() => {
            showSuccess(title, message);
        }, delay);
    };

    const showErrorDelayed = (
        title: string,
        message?: string,
        delay: number = 500
    ) => {
        setTimeout(() => {
            showError(title, message);
        }, delay);
    };

    const value: ModalContextType = {
        showModal,
        hideModal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        showDelete,
        showSuccessDelayed,
        showErrorDelayed,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
            {modalConfig && (
                <SpontyModal
                    visible={visible}
                    type={modalConfig.type}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    buttons={modalConfig.buttons}
                    onClose={hideModal}
                    autoCloseDelay={modalConfig.autoCloseDelay}
                    hideIcon={modalConfig.hideIcon}
                />
            )}
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};

// Hook de commodité pour des cas spécifiques courants
export const useQuickModals = () => {
    const modal = useModal();

    return {
        // Messages simples
        success: (message: string) => modal.showSuccess("Succès", message),
        error: (message: string) => modal.showError("Erreur", message),
        info: (message: string) => modal.showInfo("Information", message),

        // Confirmations courantes
        confirmDelete: (itemName: string, onConfirm: () => void) =>
            modal.showDelete(
                "Supprimer",
                `Êtes-vous sûr de vouloir supprimer "${itemName}" ?`,
                onConfirm
            ),

        confirmAction: (action: string, onConfirm: () => void) =>
            modal.showConfirm(
                "Confirmation",
                `Êtes-vous sûr de vouloir ${action} ?`,
                onConfirm
            ),

        // Validation d'erreurs de formulaire
        formError: (fieldName: string) =>
            modal.showError("Erreur", `Veuillez remplir le champ ${fieldName}`),

        // Messages de connection
        loginSuccess: () =>
            modal.showSuccess("Connexion réussie", "Bienvenue !"),
        loginError: () =>
            modal.showError(
                "Erreur de connexion",
                "Email ou mot de passe incorrect"
            ),

        // Messages de sauvegarde
        saveSuccess: () =>
            modal.showSuccess(
                "Sauvegardé",
                "Vos modifications ont été enregistrées"
            ),
        saveError: () =>
            modal.showError(
                "Erreur",
                "Impossible de sauvegarder vos modifications"
            ),

        // Messages de déconnexion
        logoutSuccess: () =>
            modal.showSuccess(
                "Déconnexion réussie",
                "Vous avez été déconnecté avec succès. À bientôt sur SpontyTrip ! 👋",
                true,
                4000 // Délai étendu pour laisser le temps de lire
            ),
    };
};
