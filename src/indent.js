const _ = require('lodash');

export const indentStartTokens = [
  '@alert',
  '@auth',
  '@canany',
  '@cannot',
  '@can',
  '@component',
  '@empty',
  '@env',
  '@foreach',
  '@for',
  '@forelse',
  '@guest',
  '@hassection',
  '@if',
  '@isset',
  '@permission',
  '@permissions',
  '@php',
  '@push',
  '@section',
  '@slot',
  '@switch',
  '@unless',
  '@verbatim',
  '@while',
  '@production',
  '@prepend',
  '@once',
  '@error',
];

export const indentEndTokens = [
  '@endalert',
  '@endauth',
  '@endcanany',
  '@endcannot',
  '@endcan',
  '@endcomponent',
  '@endempty',
  '@endenv',
  '@endfor',
  '@endforeach',
  '@endforelse',
  '@endguest',
  '@endif',
  '@endisset',
  '@endphp',
  '@endpush',
  '@endsection',
  '@endslot',
  '@endswitch',
  '@endunless',
  '@endverbatim',
  '@endwhile',
  '@show',
  '@stop',
  '@endproduction',
  '@endprepend',
  '@endonce',
  '@enderror',
];

export const indentElseTokens = [
  '@elseenv',
  '@elseif',
  '@elsecanany',
  '@elsecannot',
  '@elsecan',
  '@else',
];

export const tokenForIndentStartOrElseTokens = ['@forelse'];

export const indentStartOrElseTokens = ['@empty'];

export const indentStartAndEndTokens = ['@default'];

export const phpKeywordStartTokens = [
  '@forelse',
  '@if',
  '@for',
  '@foreach',
  '@while',
  '@sectionmissing',
  '@case',
];

export const phpKeywordEndTokens = [
  '@endforelse',
  '@endif',
  '@endfor',
  '@endforeach',
  '@endwhile',
  '@break',
];

export const inlineFunctionTokens = ['@json'];

export function hasStartAndEndToken(tokenizeLineResult, originalLine) {
  return (
    _.filter(tokenizeLineResult.tokens, (tokenStruct) => {
      const token = originalLine
        .substring(tokenStruct.startIndex, tokenStruct.endIndex)
        .trim();

      return (
        _.includes(indentStartTokens, token) ||
        _.includes(indentEndTokens, token)
      );
    }).length >= 2
  );
}
