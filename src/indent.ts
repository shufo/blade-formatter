import _ from 'lodash';

export const directivePrefix = '@';

export const indentStartTokens = [
  '@alert',
  '@push',
  '@slot',
  '@switch',
  '@unless',
  '@verbatim',
  '@prepend',
  '@once',
  '@error',
  '@empty',
  '@guest',
  '@isset',
  '@permission',
  '@permissions',
  '@canany',
  '@cannot',
  '@can',
  '@role',
  '@hasrole',
  '@hasanyrole',
  '@hasallroles',
  '@unlessrole',
  '@hasexactroles',
  '@if',
  '@production',
  '@env',
  '@while',
  '@auth',
  '@forelse',
  '@for',
  '@foreach',
  '@php',
  '@component',
  '@hassection',
  '@section',
];

export const indentStartTokensWithoutPrefix = _.map(indentStartTokens, (token) => token.substring(1));

export const indentEndTokens = [
  '@endalert',
  '@endpush',
  '@endslot',
  '@endswitch',
  '@endunless',
  '@endverbatim',
  '@show',
  '@stop',
  '@endprepend',
  '@endonce',
  '@enderror',
  '@append',
  '@overwrite',
  '@endempty',
  '@endguest',
  '@endisset',
  '@endpermission',
  '@endpermissions',
  '@endcanany',
  '@endcannot',
  '@endcan',
  '@endrole',
  '@endhasrole',
  '@endhasanyrole',
  '@endhasallroles',
  '@endunlessrole',
  '@endhasexactroles',
  '@endif',
  '@endproduction',
  '@endenv',
  '@endwhile',
  '@endauth',
  '@endforelse',
  '@endforeach',
  '@endfor',
  '@endphp',
  '@endcomponent',
  '@endsection',
];

export const indentElseTokens = ['@elseenv', '@elseif', '@elsecanany', '@elsecannot', '@elsecan', '@else'];

// Directives which do not need an end token if a parameter is present
export const optionalStartWithoutEndTokens = {
  '@section': 2,
  '@push': 2,
  '@prepend': 2,
  '@slot': 2,
};

export const tokenForIndentStartOrElseTokens = ['@forelse'];

export const indentStartOrElseTokens = ['@empty'];

export const indentStartAndEndTokens = ['@default'];

export const phpKeywordStartTokens = ['@forelse', '@if', '@for', '@foreach', '@while', '@sectionmissing', '@case'];

export const phpKeywordEndTokens = ['@endforelse', '@endif', '@endforeach', '@endfor', '@endwhile', '@break'];

export const inlineFunctionTokens = [
  '@set',
  '@json',
  '@selected',
  '@checked',
  '@disabled',
  '@php',
  '@include',
  '@includeif',
  '@includewhen',
  '@includeunless',
  '@includefirst',
  '@button',
  '@class',
];

export const conditionalTokens = ['@if', '@while', '@case', '@isset', '@empty', '@elseif', '@component'];

export function hasStartAndEndToken(tokenizeLineResult: any, originalLine: any) {
  return (
    _.filter(tokenizeLineResult.tokens, (tokenStruct: any) => {
      const token = originalLine.substring(tokenStruct.startIndex, tokenStruct.endIndex).trim();

      return _.includes(indentStartTokens, token) || _.includes(indentEndTokens, token);
    }).length >= 2
  );
}
