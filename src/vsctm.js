import { readFile } from './util';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const appRootPath = require('app-root-path');
export class VscodeTextmate {
  constructor(vsctm, oniguruma) {
    this.vsctm = vsctm;
    this.oniguruma = oniguruma || require('vscode-oniguruma');
    this.loadWasm();
  }

  loadWasm() {
    const REPO_ROOT = appRootPath.toString();
    const wasm = fs.readFileSync(path.join(REPO_ROOT, './wasm/onig.wasm')).buffer;

    if (!this.oniguruma.initCalled) {
      this.oniguruma.loadWASM(wasm);
      this.oniguruma.initCalled = true;
    }
  }

  createRegistry(content) {
    this.registry = new this.vsctm.Registry({
      loadGrammar: (scopeName) => {
        if (scopeName === 'text.html.php.blade') {
          // https://github.com/onecentlin/
          // laravel-blade-snippets-vscode/
          // blob/master/syntaxes/blade.tmLanguage.json
          return readFile(
            `${__dirname}/../syntaxes/blade.tmLanguage.json`,
          ).then((content) =>
            this.vsctm.parseRawGrammar(
              content.toString(),
              './blade.tmLanguage.json',
            ),
          );
        }
        return null;
      },
      onigLib: Promise.resolve({
        createOnigScanner: (sources) => new this.oniguruma.OnigScanner(sources),
        createOnigString: (str) => new this.oniguruma.OnigString(str),
      }),
    });

    return this.registry;
  }

  tokenizeLines(splitedLines, grammar) {
    return _.map(splitedLines, (line) => {
      return grammar.tokenizeLine(line, this.vsctm.INITIAL);
    });
  }
}

export default {
  VscodeTextmate,
}
