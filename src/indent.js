const _ = require('lodash');

export const indentStartTokens = [
  '@alert',
  '@auth',
  '@can',
  '@component',
  '@empty',
  '@env',
  '@for',
  '@foreach',
  '@forelse',
  '@guest',
  '@hasSection',
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
];

export const indentEndTokens = [
  '@endalert',
  '@endauth',
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
];

export const indentElseTokens = ['@else', '@elseenv', '@elseif'];

export const tokenForIndentStartOrElseTokens = ['@forelse'];

export const indentStartOrElseTokens = ['@empty'];

export function hasStartAndEndToken(tokenizeLineResult, originalLine) {
  return (
    _.filter(tokenizeLineResult.tokens, tokenStruct => {
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
