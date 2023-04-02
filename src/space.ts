import _ from 'lodash';

/**
 * Adjust spaces in blade directives
 * @param content
 * @returns
 */
// eslint-disable-next-line import/prefer-default-export
export function adjustSpaces(content: string): string {
  const directivesRequiredSpace = ['@unless'];

  return _.replace(
    content,
    new RegExp(`(?<!@)(${directivesRequiredSpace.join('|')})\\s*\\(`, 'gi'),
    (matched: string, p1: string) => {
      return `${p1} (`;
    },
  );
}
