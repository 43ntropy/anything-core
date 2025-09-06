export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const testMatch = [
    "<rootDir>/tests/**/*.test.ts",
];
export const transform = {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'jest.tsconfig.json' }],
};