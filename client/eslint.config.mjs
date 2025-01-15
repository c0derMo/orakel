// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    {
        ignores: ["eslint.config.mjs", "index.html"],
    },
    {
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            tseslint.configs.stylistic,
            eslintPluginVue.configs["flat/recommended"],
        ],
        plugins: {
            "typescript-eslint": tseslint.plugin,
        },
        files: ["**/*.{ts,vue}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                parser: tseslint.parser,
                project: "./tsconfig.app.json",
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: [".vue"],
            },
        },
        rules: {
            "vue/html-indent": ["warn", 4],
            "vue/max-attributes-per-line": ["off"],
            "vue/multi-word-component-names": ["off"],
            "vue/singleline-html-element-content-newline": ["off"],
            "@typescript-eslint/consistent-type-imports": "error",
        },
    },
    eslintConfigPrettier
);
