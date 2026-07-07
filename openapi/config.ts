import {defineConfig} from "@hey-api/openapi-ts"

export default defineConfig({
  input: './openapi/main.yaml',
  output: './src/services/api',
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/schemas',
    {
      asClass: true,
      name: '@hey-api/sdk',
    },
    {
      enums: "javascript",
      identifierCase: "preserve",
      name: '@hey-api/typescript',
    },
  ],
});