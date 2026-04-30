import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react-dom/client",
];

const terserOptions = {
  ecma: 2017,
  module: true,
  compress: {
    drop_console: true,
    drop_debugger: true,
    passes: 3,
    pure_getters: true,
    dead_code: true,
    conditionals: true,
    collapse_vars: true,
    reduce_vars: true,
    toplevel: true,
  },
  mangle: {
    toplevel: true,
    properties: {
      regex: /^_[a-z]/,
      reserved: [
        "children",
        "className",
        "style",
        "ref",
        "key",
        "onClick",
        "onChange",
        "onSubmit",
        "disabled",
        "placeholder",
        "value",
        "defaultValue",
        "type",
        "name",
        "id",
        "href",
        "src",
        "alt",
      ],
    },
  },
  format: {
    comments: false,
    ecma: 2017,
  },
};

// "use client" directives are intentionally hoisted to the bundle banner,
// so silence rollup's per-file MODULE_LEVEL_DIRECTIVE warnings.
const onwarn = (warning, warn) => {
  if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
  if (
    warning.code === "SOURCEMAP_ERROR" &&
    /Can't resolve original location/.test(warning.message ?? "")
  ) return;
  warn(warning);
};

/** @type {import('rollup').RollupOptions[]} */
const config = [
  // ESM build
  {
    input: "ds/index.ts",
    onwarn,
    output: {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: false,
      banner: '"use client";',
    },
    external,
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: [".ts", ".tsx", ".js", ".jsx"],
      }),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2017",
        jsx: "automatic",
        tsconfig: "./tsconfig.build.json",
      }),
      commonjs(),
      postcss({
        extract: "styles.css",
        minimize: true,
      }),
      terser(terserOptions),
    ],
  },
  // CJS build
  {
    input: "ds/index.ts",
    onwarn,
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: false,
    },
    external,
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: [".ts", ".tsx", ".js", ".jsx"],
      }),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2017",
        jsx: "automatic",
        tsconfig: "./tsconfig.build.json",
      }),
      commonjs(),
      postcss({
        extract: false,
      }),
      terser(terserOptions),
    ],
  },
  // Type declarations
  {
    input: "ds/index.ts",
    onwarn,
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    external,
    plugins: [
      dts({
        tsconfig: "./tsconfig.build.json",
      }),
    ],
  },
];

export default config;
