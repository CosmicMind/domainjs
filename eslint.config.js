import eslint from "@eslint/js"
import globals from "globals"
import typescriptEslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"

export default typescriptEslint.config(
    { ignores: ["**/*.d.ts", "**/coverage", "**/dist"] },
    {
        extends: [
            eslint.configs.recommended,
            ...typescriptEslint.configs.recommended,
        ],
        files: ["**/*.{ts}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
            parserOptions: {
                parser: {
                    ts: typescriptEslint.parser,
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@stylistic/semi": ["error", "never"],
            "@stylistic/block-spacing": ["error", "always"],
            "@stylistic/comma-dangle": ["error", {
                "arrays": "never",
                "objects": "always-multiline",
                "imports": "always-multiline",
                "exports": "always-multiline",
                "functions": "never",
                "enums": "always-multiline",
                "generics": "always-multiline",
            }],
            "@stylistic/indent": ["error", 4, { SwitchCase: 1 }],

            // Spacing rules
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/array-bracket-spacing": ["error", "never"],
            "@stylistic/space-in-parens": ["error", "never"],
            "@stylistic/space-infix-ops": ["error"],

            // Line rules
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/no-trailing-spaces": ["error"],
            "@stylistic/max-len": ["error", { "code": 255 }],

            // Other formatting rules
            "@stylistic/quotes": ["error", "single"],
            "@stylistic/brace-style": ["error", "1tbs"],
            "@stylistic/arrow-spacing": ["error", { "before": true, "after": true }],
            "@stylistic/keyword-spacing": ["error", { "before": true, "after": true }],
        },
        plugins: {
            "@stylistic": stylistic,
        },
    },
)
