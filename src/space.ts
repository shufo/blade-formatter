import _ from 'lodash';
import { nestedParenthesisRegex } from './regex';

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
    new RegExp(`(?<!@)(${directivesRequiredSpace.join('|')})\\s*${nestedParenthesisRegex}`, 'gi'),
    (_matched: string, p1: string, p2: string) => `${p1} (${p2})`,
  );
}
