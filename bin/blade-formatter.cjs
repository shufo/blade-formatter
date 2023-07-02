#!/usr/bin/env node

"use strict";

function runCli(cli) {
  return cli.default.default();
}

var dynamicImport = new Function("module", "return import(module)");

module.exports.promise = dynamicImport("../dist/cli-bundle.cjs").then(runCli);
