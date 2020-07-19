import { readFile } from './util';

const fs = require('fs');
const _ = require('lodash');
const vsctmModule = require('vscode-oniguruma');

export class VscodeTextmate {
  constructor(vsctm, oniguruma) {
    this.vsctm = vsctm;
    this.oniguruma = oniguruma || vsctmModule;
    this.loadWasm();
  }

  loadWasm() {
    const wasm = fs.readFileSync(`${__dirname}/../wasm/onig.wasm`).buffer;

    if (!this.oniguruma.initCalled) {
      this.oniguruma.loadWASM(wasm);
      this.oniguruma.initCalled = true;
    }
  }

  createRegistry() {
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
};
