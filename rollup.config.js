import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf-8")
);

export default [
  // Build JS bundles
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "socket.io-client",
      "react-markdown",
      "lucide-react",
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
      postcss({
        extract: true,
        minimize: true,
        sourceMap: true,
      }),
    ],
  },
  // Build type definitions
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "socket.io-client",
      "react-markdown",
      "lucide-react",
      /\.css$/,
    ],
    plugins: [
      dts({
        tsconfig: "./tsconfig.json",
        respectExternal: true,
        compilerOptions: {
          allowSyntheticDefaultImports: true,
        },
      }),
    ],
  },
];
