import { readFile } from './util';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const vsctmModule = require('vscode-oniguruma');

const dirname = path.dirname(require.resolve(module.id));

export class VscodeTextmate {
  constructor(vsctm, oniguruma) {
    this.vsctm = vsctm;
    this.oniguruma = oniguruma || vsctmModule;
  }

  async loadWasm() {
    if (!this.wasm) {
      this.wasm = fs.readFileSync(`${dirname}/../wasm/onig.wasm`).buffer;
    }

    try {
      await this.oniguruma.loadWASM(this.wasm);
    } catch (error) {
      this.oniguruma.initCalled = true;
    }

    this.oniguruma.initCalled = true;

    return true;
  }

  async createRegistry() {
    return new this.vsctm.Registry({
      loadGrammar: (scopeName) => {
        if (scopeName === 'text.html.php.blade') {
          // https://github.com/onecentlin/
          // laravel-blade-snippets-vscode/
          // blob/master/syntaxes/blade.tmLanguage.json
          return readFile(
            `${dirname}/../syntaxes/blade.tmLanguage.json`,
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
  }

  tokenizeLines(splitedLines, grammar) {
    return _.map(splitedLines, (line) => {
      return grammar.tokenizeLine(line, this.vsctm.INITIAL);
    });
  }
}

export default {
  VscodeTextmate,
};
