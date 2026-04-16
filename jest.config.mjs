import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import("jest").Config} */
const customJestConfig = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@i18n/(.*)$": "<rootDir>/src/i18n/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**",
    "!src/i18n/**",
  ],
  clearMocks: true,
};

export default createJestConfig(customJestConfig);
