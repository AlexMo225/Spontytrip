// Test simple pour vérifier la configuration Jest

describe("Configuration Jest", () => {
    it("devrait pouvoir exécuter un test simple", () => {
        expect(1 + 1).toBe(2);
    });

    it("devrait pouvoir utiliser les fonctions async", async () => {
        const result = await Promise.resolve("test");
        expect(result).toBe("test");
    });

    it("devrait pouvoir utiliser les mocks Jest", () => {
        const mockFn = jest.fn();
        mockFn("test");

        expect(mockFn).toHaveBeenCalledWith("test");
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
