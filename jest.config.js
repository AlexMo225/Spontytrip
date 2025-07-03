module.exports = {
    testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"],
    testEnvironment: "node",
    verbose: true,
    clearMocks: true,
    transform: {
        "^.+\\.(ts|tsx)$": "babel-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};
