import pluginJs from "@eslint/js";

export default [
    {
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                alert: "readonly",
                fetch: "readonly",
                Blob: "readonly",
                FileReader: "readonly",
                Image: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                Date: "readonly",
                Math: "readonly",
                parseInt: "readonly",
                isNaN: "readonly",
                // Jest Globals
                describe: "readonly",
                test: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly",
                app: "readonly"
            }
        }
    },
    {
        ignores: ["**/build/**"]
    },
    pluginJs.configs.recommended,
    {
        rules: {
            "no-unused-vars": ["error", { "args": "none" }]
        }
    }
];
