import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "src/lancer-initiative.ts",
  output: {
    dir: "dist",
    format: "es",
    sourcemap: true,
    chunkFileNames: chunkInfo => {
      switch (chunkInfo.name) {
        case "starwarsffg":
          return "[name].js";
        default:
          return "[name]-[hash].js";
      }
    },
    plugins: [
      terser({ keep_classnames: true, keep_fnames: true }),
    ],
  },
  plugins: [
    copy({ targets: [{ src: "public/*", dest: "dist" }] }),
    nodeResolve(),
    typescript(),
  ],
};
export default config;
