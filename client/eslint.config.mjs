// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginVue from "eslint-plugin-vue";

export default tseslint.config(
    {
        ignores: ["eslint.config.mjs", "index.html"],
    },
    {
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            eslintPluginVue.configs["flat/recommended"],
        ],
        files: ["**/*.{ts,vue}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                parser: tseslint.parser,
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
        },
    },
);
