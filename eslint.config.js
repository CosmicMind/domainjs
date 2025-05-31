import eslint from "@eslint/js"
import globals from "globals"
import typescriptEslint from "typescript-eslint"
import stylisticJsPlugin from "@stylistic/eslint-plugin-js"

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
                parser: typescriptEslint.parser,
            },
        },
        rules: {
            "@stylistic/js/semi": ["error", "never"],
            "@stylistic/js/block-spacing": ["error", "always"],
            "@stylistic/js/comma-dangle": ["error", {
                "arrays": "never",
                "objects": "always-multiline",
                "imports": "always-multiline",
                "exports": "always-multiline",
                "functions": "never",
            }],
            "@stylistic/js/indent": ["error", 4, { SwitchCase: 1 }],

            // Spacing rules
            "@stylistic/js/object-curly-spacing": ["error", "always"],
            "@stylistic/js/array-bracket-spacing": ["error", "never"],
            "@stylistic/js/space-in-parens": ["error", "never"],
            "@stylistic/js/space-infix-ops": ["error"],

            // Line rules
            "@stylistic/js/eol-last": ["error", "always"],
            "@stylistic/js/no-trailing-spaces": ["error"],
            "@stylistic/js/max-len": ["error", { "code": 255 }],

            // Other formatting rules
            "@stylistic/js/quotes": ["error", "single"],
            "@stylistic/js/brace-style": ["error", "1tbs"],
            "@stylistic/js/arrow-spacing": ["error", { "before": true, "after": true }],
            "@stylistic/js/keyword-spacing": ["error", { "before": true, "after": true }],
        },
        plugins: {
            "@stylistic/js": stylisticJsPlugin, // Correct, explicit key-value entry.
        },
    },
)
