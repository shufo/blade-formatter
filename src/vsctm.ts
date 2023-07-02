import { promises as fs } from 'fs';
import _ from 'lodash';
import * as vscodeOniguruma from 'vscode-oniguruma';
import path from 'path';
import { readFile } from './util';

export class VscodeTextmate {
  oniguruma: any;

  registry: any;

  vsctm: any;

  initCalled: any;

  constructor(vsctm: any, oniguruma: any) {
    // @ts-ignore
    return (async () => {
      this.vsctm = vsctm.default ?? vsctm;
      // @ts-ignore
      this.oniguruma = oniguruma || vscodeOniguruma?.default || vscodeOniguruma;
      await this.loadWasm();
      return this;
    })();
  }

  async loadWasm() {
    const wasm = await fs.readFile(
      // @ts-ignore
      // eslint-disable-next-line
      require.resolve('vscode-oniguruma/release/onig.wasm'),
    );
    await this.oniguruma?.loadWASM(wasm.buffer);

    if (!this.initCalled) {
      try {
        this.oniguruma.loadWASM(wasm.buffer);
      } catch (error) {
        this.initCalled = true;
      }

      this.initCalled = true;
    }
  }

  createRegistry() {
    this.registry = new this.vsctm.Registry({
      loadGrammar: (scopeName: any) => {
        if (scopeName === 'text.html.php.blade') {
          // https://github.com/onecentlin/
          // laravel-blade-snippets-vscode/
          // blob/master/syntaxes/blade.tmLanguage.json
          return readFile(path.resolve(__dirname, `../syntaxes/blade.tmLanguage.json`)).then((content: any) =>
            this.vsctm.parseRawGrammar(content.toString(), './blade.tmLanguage.json'),
          );
        }
        return null;
      },
      onigLib: Promise.resolve({
        createOnigScanner: (sources: any) => new this.oniguruma.OnigScanner(sources),
        createOnigString: (str: any) => new this.oniguruma.OnigString(str),
      }),
    });

    return this.registry;
  }

  tokenizeLines(splitedLines: any, grammar: any) {
    return _.map(splitedLines, (line: any) => grammar.tokenizeLine(line, this.vsctm?.INITIAL));
  }
}

export default {
  VscodeTextmate,
};
