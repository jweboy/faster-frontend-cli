// import Module from 'module';
import path from 'path';

const Module = require('module');

export const createRequire =
  Module.createRequire ||
  Module.createRequireFromPath ||
  function createModule(filename) {
    const mod = new Module(filename, null);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));

    mod._compile(`module.exports = require;`, filename);

    return mod.exports;
  };

export const loadModule = (request, context) => {
  try {
    return createRequire(context)(request);
  } catch (e) {
    const resolvedPath = exports.resolveModule(request, context);
    if (resolvedPath) {
      return require(resolvedPath);
    }
  }
};
