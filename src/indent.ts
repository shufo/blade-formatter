import _ from 'lodash';

export const directivePrefix = '@';

export const indentStartTokens = [
  '@alert',
  '@pushonce',
  '@push',
  '@slot',
  '@switch',
  '@unless',
  '@verbatim',
  '@prependonce',
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
  '@section',
  '@customdirective',
];

export const indentStartTokensWithoutPrefix = _.map(indentStartTokens, (token) => token.substring(1));

export const indentEndTokens = [
  '@endalert',
  '@endpushonce',
  '@endpush',
  '@endslot',
  '@endswitch',
  '@endunless',
  '@endverbatim',
  '@show',
  '@stop',
  '@endprependonce',
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
  '@endcustomdirective',
];

export const indentElseTokens = [
  '@elseenv',
  '@elseif',
  '@elsecanany',
  '@elsecannot',
  '@elsecan',
  '@else',
  '@elsecustomdirective',
];

// Directives which do not need an end token if a parameter is present
export const optionalStartWithoutEndTokens = {
  '@section': 2,
  '@push': 2,
  '@prepend': 2,
  '@slot': 2,
};

export const tokenForIndentStartOrElseTokens = ['@forelse', '@if'];

export const indentStartOrElseTokens = ['@empty'];

export const indentStartAndEndTokens = ['@default'];

export const phpKeywordStartTokens = ['@forelse', '@if', '@for', '@foreach', '@while', '@sectionmissing', '@case'];

export const phpKeywordEndTokens = ['@endforelse', '@endif', '@endforeach', '@endfor', '@endwhile', '@break'];

export const inlinePhpDirectives = ['@button', '@class', '@include', '@disabled', '@checked', '@json'];

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
  '@props',
  '@aware',
];

export const conditionalTokens = [
  '@if',
  '@while',
  '@case',
  '@isset',
  '@empty',
  '@elseif',
  '@component',
  '@hassection',
  '@unless',
];

export const unbalancedStartTokens = ['@hassection'];

export const cssAtRuleTokens = [
  '@charset',
  '@color-profile',
  '@counter-style',
  '@font-face',
  '@font-feature-values',
  '@import',
  '@keyframes',
  '@media',
  '@namespace',
  '@page',
  '@property',
  '@supports',
];

export function hasStartAndEndToken(tokenizeLineResult: any, originalLine: any) {
  return (
    _.filter(tokenizeLineResult.tokens, (tokenStruct: any) => {
      const token = originalLine.substring(tokenStruct.startIndex, tokenStruct.endIndex).trim();

      return _.includes(indentStartTokens, token) || _.includes(indentEndTokens, token);
    }).length >= 2
  );
}
