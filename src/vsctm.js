import { readFile } from './util';

const vsctm = require('vscode-textmate');
const _ = require('lodash');

export function createRegistry() {
  return new vsctm.Registry({
    loadGrammar: (scopeName) => {
      if (scopeName === 'text.html.php.blade') {
        // https://github.com/onecentlin/
        // laravel-blade-snippets-vscode/
        // blob/master/syntaxes/blade.tmLanguage.json
        return readFile(
          `${__dirname}/../syntaxes/blade.tmLanguage.json`,
        ).then((content) =>
          vsctm.parseRawGrammar(content.toString(), './blade.tmLanguage.json'),
        );
      }
      return null;
    },
  });
}

export function tokenizeLines(splitedLines, grammar) {
  return _.map(splitedLines, (line) => {
    return grammar.tokenizeLine(line, vsctm.INITIAL);
  });
}
