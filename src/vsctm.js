import { readFile } from './util';

const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const vsctmModule = require('vscode-oniguruma');

const dirname = path.dirname(require.resolve(module.id));

export class VscodeTextmate {
  constructor(vsctm, oniguruma) {
    this.vsctm = vsctm;
    this.oniguruma = oniguruma || vsctmModule;
    this.loadWasm();
  }

  async loadWasm() {
    const wasm = await fs.readFile(`${dirname}/../wasm/onig.wasm`);

    if (!this.oniguruma.initCalled) {
      try {
        this.oniguruma.loadWASM(wasm.buffer);
      } catch (error) {
        this.oniguruma.initCalled = true;
      }

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
