const off = 0;
const warn = 1;
const error = 2;

module.exports = {
    root: true,
    env: {
        browser: true,
        es6: false,
        node: true,
    },

    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:jest/recommended',
    ],
    rules: {
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'prefer-spread': error,
        'prefer-rest-params': off,
        '@typescript-eslint/ban-ts-ignore': off,
        '@typescript-eslint/triple-slash-reference': off,
        '@typescript-eslint/camelcase': off,
        '@typescript-eslint/interface-name-prefix': off,
        '@typescript-eslint/no-inferrable-types': off,
        '@typescript-eslint/no-namespace': off,
        '@typescript-eslint/no-explicit-any': off,
        '@typescript-eslint/explicit-function-return-type': off,
        '@typescript-eslint/no-this-alias': off,
        '@typescript-eslint/no-use-before-define': off,
        '@typescript-eslint/no-unused-vars': off,
        '@typescript-eslint/no-empty-function': off,
        '@typescript-eslint/prefer-optional-chain': error,
        '@typescript-eslint/prefer-nullish-coalescing': error,
    },
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
};
