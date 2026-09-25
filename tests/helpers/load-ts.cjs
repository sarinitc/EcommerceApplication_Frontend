/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

module.exports = function createLoader({ mocks = {}, env = {}, fetchImpl = fetch } = {}) {
  const cache = new Map();
  function load(relativePath) {
    const filename = path.resolve(__dirname, "../..", relativePath);
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith("@/")) return load(`src/${id.slice(2)}.ts`);
      if (id.startsWith(".")) return load(path.relative(path.resolve(__dirname, "../.."), path.resolve(path.dirname(filename), `${id}.ts`)));
      return require(id);
    };
    new Function("exports", "require", "module", "process", "fetch", compiled)(
      loadedModule.exports, localRequire, loadedModule, { env }, fetchImpl,
    );
    return loadedModule.exports;
  }
  return load;
};
