import { storage } from "../config/firebase";

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export class ImageService {
    // Upload d'une image de profil
    static async uploadProfileImage(
        userId: string,
        imageUri: string
    ): Promise<ImageUploadResult> {
        try {
            console.log("📸 Upload de l'image de profil pour:", userId);

            // Créer un nom de fichier unique
            const timestamp = Date.now();
            const fileName = `profile_${userId}_${timestamp}.jpg`;
            const storageRef = storage.ref(`profile-images/${fileName}`);

            // Convertir l'URI en blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            console.log("🔄 Upload en cours...");

            // Upload du fichier
            const uploadTask = await storageRef.put(blob);

            // Obtenir l'URL de téléchargement
            const downloadURL = await uploadTask.ref.getDownloadURL();

            console.log("✅ Image uploadée avec succès:", downloadURL);

            return {
                success: true,
                url: downloadURL,
            };
        } catch (error) {
            console.error("❌ Erreur lors de l'upload de l'image:", error);
            return {
                success: false,
                error: "Erreur lors de l'upload de l'image",
            };
        }
    }

    // Supprimer une ancienne image de profil
    static async deleteProfileImage(imageUrl: string): Promise<boolean> {
        try {
            if (!imageUrl || !imageUrl.includes("firebase")) {
                return true; // Pas une image Firebase, rien à supprimer
            }

            console.log("🗑️ Suppression de l'ancienne image:", imageUrl);

            const imageRef = storage.refFromURL(imageUrl);
            await imageRef.delete();

            console.log("✅ Ancienne image supprimée");
            return true;
        } catch (error) {
            console.error(
                "❌ Erreur lors de la suppression de l'image:",
                error
            );
            return false;
        }
    }

    // Mettre à jour l'image de profil (upload + suppression de l'ancienne)
    static async updateProfileImage(
        userId: string,
        newImageUri: string,
        oldImageUrl?: string
    ): Promise<ImageUploadResult> {
        try {
            // Upload de la nouvelle image
            const uploadResult = await this.uploadProfileImage(
                userId,
                newImageUri
            );

            if (uploadResult.success && oldImageUrl) {
                // Supprimer l'ancienne image (en arrière-plan, pas bloquant)
                this.deleteProfileImage(oldImageUrl).catch((error) => {
                    console.warn(
                        "⚠️ Impossible de supprimer l'ancienne image:",
                        error
                    );
                });
            }

            return uploadResult;
        } catch (error) {
            console.error(
                "❌ Erreur lors de la mise à jour de l'image:",
                error
            );
            return {
                success: false,
                error: "Erreur lors de la mise à jour de l'image",
            };
        }
    }
}
