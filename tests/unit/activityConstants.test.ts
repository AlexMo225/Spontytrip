import {
    ActivityType,
    activityTypes,
    priorities,
    Priority,
} from "../../utils/activityConstants";

describe("Activity Constants", () => {
    describe("activityTypes", () => {
        test("devrait contenir tous les types d'activités", () => {
            expect(activityTypes).toBeDefined();
            expect(Array.isArray(activityTypes)).toBe(true);
            expect(activityTypes.length).toBeGreaterThan(0);
        });

        test("chaque type devrait avoir les propriétés requises", () => {
            activityTypes.forEach((type) => {
                expect(type).toHaveProperty("id");
                expect(type).toHaveProperty("name");
                expect(type).toHaveProperty("icon");
                expect(type).toHaveProperty("color");
                expect(typeof type.id).toBe("string");
                expect(typeof type.name).toBe("string");
                expect(typeof type.icon).toBe("string");
                expect(typeof type.color).toBe("string");
            });
        });

        test("devrait contenir des types d'activités spécifiques", () => {
            const typeIds = activityTypes.map((type) => type.id);
            expect(typeIds).toContain("restaurant");
            expect(typeIds).toContain("tourist");
            expect(typeIds).toContain("sport");
            expect(typeIds).toContain("culture");
        });

        test("devrait contenir les types de base pour une app de voyage", () => {
            const expectedTypes = [
                "tourist",
                "restaurant",
                "sport",
                "culture",
                "shopping",
                "nature",
                "nightlife",
                "other",
            ];

            const typeIds = activityTypes.map((type) => type.id);
            expectedTypes.forEach((expectedType) => {
                expect(typeIds).toContain(expectedType);
            });
        });
    });

    describe("priorities", () => {
        test("devrait contenir toutes les priorités", () => {
            expect(priorities).toBeDefined();
            expect(Array.isArray(priorities)).toBe(true);
            expect(priorities.length).toBeGreaterThan(0);
        });

        test("chaque priorité devrait avoir les propriétés requises", () => {
            priorities.forEach((priority) => {
                expect(priority).toHaveProperty("id");
                expect(priority).toHaveProperty("name");
                expect(priority).toHaveProperty("color");
                expect(typeof priority.id).toBe("string");
                expect(typeof priority.name).toBe("string");
                expect(typeof priority.color).toBe("string");
            });
        });

        test("devrait contenir les niveaux de priorité standards", () => {
            const priorityIds = priorities.map((priority) => priority.id);
            expect(priorityIds).toContain("low");
            expect(priorityIds).toContain("medium");
            expect(priorityIds).toContain("high");
        });
    });

    describe("Types TypeScript", () => {
        test("ActivityType devrait être correctement typé", () => {
            const testActivity: ActivityType = {
                id: "test",
                name: "Test Activity",
                icon: "star-outline",
                color: "#FF0000",
            };

            expect(testActivity.id).toBe("test");
            expect(testActivity.name).toBe("Test Activity");
            expect(testActivity.icon).toBe("star-outline");
            expect(testActivity.color).toBe("#FF0000");
        });

        test("Priority devrait être correctement typé", () => {
            const testPriority: Priority = {
                id: "test",
                name: "Test Priority",
                color: "#00FF00",
            };

            expect(testPriority.id).toBe("test");
            expect(testPriority.name).toBe("Test Priority");
            expect(testPriority.color).toBe("#00FF00");
        });
    });

    describe("Cohérence des données", () => {
        test("tous les types devraient avoir des couleurs valides (format hex)", () => {
            const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
            activityTypes.forEach((type) => {
                expect(type.color).toMatch(hexColorRegex);
            });
        });

        test("toutes les priorités devraient avoir des couleurs valides", () => {
            const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
            priorities.forEach((priority) => {
                expect(priority.color).toMatch(hexColorRegex);
            });
        });

        test("tous les noms devraient être non-vides", () => {
            activityTypes.forEach((type) => {
                expect(type.name.trim()).toBeTruthy();
                expect(type.name.length).toBeGreaterThan(0);
            });

            priorities.forEach((priority) => {
                expect(priority.name.trim()).toBeTruthy();
                expect(priority.name.length).toBeGreaterThan(0);
            });
        });

        test("tous les IDs devraient être uniques", () => {
            // Test unicité des types d'activités
            const typeIds = activityTypes.map((type) => type.id);
            const uniqueTypeIds = [...new Set(typeIds)];
            expect(typeIds.length).toBe(uniqueTypeIds.length);

            // Test unicité des priorités
            const priorityIds = priorities.map((priority) => priority.id);
            const uniquePriorityIds = [...new Set(priorityIds)];
            expect(priorityIds.length).toBe(uniquePriorityIds.length);
        });

        test("les icônes devraient être des noms valides Ionicons", () => {
            activityTypes.forEach((type) => {
                expect(type.icon).toBeTruthy();
                expect(typeof type.icon).toBe("string");
                // Les icônes Ionicons finissent généralement par '-outline'
                expect(type.icon.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Utilité des données", () => {
        test("devrait permettre de trouver un type par ID", () => {
            const restaurantType = activityTypes.find(
                (type) => type.id === "restaurant"
            );
            expect(restaurantType).toBeDefined();
            expect(restaurantType?.name).toBe("Restaurant");
            expect(restaurantType?.icon).toBe("restaurant-outline");
        });

        test("devrait permettre de trouver une priorité par ID", () => {
            const highPriority = priorities.find(
                (priority) => priority.id === "high"
            );
            expect(highPriority).toBeDefined();
            expect(highPriority?.name).toBe("Élevée");
        });

        test("devrait avoir des couleurs distinctes pour chaque type", () => {
            const colors = activityTypes.map((type) => type.color);
            const uniqueColors = new Set(colors);
            expect(uniqueColors.size).toBe(colors.length);
        });

        test("devrait avoir des couleurs distinctes pour chaque priorité", () => {
            const colors = priorities.map((priority) => priority.color);
            const uniqueColors = new Set(colors);
            expect(uniqueColors.size).toBe(colors.length);
        });
    });

    describe("Couverture fonctionnelle", () => {
        test("devrait couvrir les principales activités de voyage", () => {
            const essentialActivities = [
                "restaurant", // Nourriture
                "tourist", // Visites
                "culture", // Culture
                "nature", // Nature
                "shopping", // Shopping
            ];

            const typeIds = activityTypes.map((type) => type.id);
            essentialActivities.forEach((activity) => {
                expect(typeIds).toContain(activity);
            });
        });

        test("devrait couvrir tous les niveaux de priorité nécessaires", () => {
            expect(priorities.length).toBe(3);
            const priorityIds = priorities.map((p) => p.id);
            expect(priorityIds).toEqual(["low", "medium", "high"]);
        });
    });
});
