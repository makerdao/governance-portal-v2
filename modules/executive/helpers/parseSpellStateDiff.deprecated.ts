/* This method was used to parse the spell diff before */

import invariant from 'tiny-invariant';
import { SpellStateDiff } from '../types/spellStateDiff';

export function parseSpellStateDiff(rawStateDiff): SpellStateDiff {
  invariant(
    rawStateDiff?.hasBeenCast !== undefined && rawStateDiff?.decodedDiff !== undefined,
    'invalid or undefined raw state diff'
  );

  const { hasBeenCast, executedOn, decodedDiff = [] } = rawStateDiff;
  const groupedDiff: { [key: string]: any } = decodedDiff.reduce((groups, diff) => {
    const keys = diff.keys
      ? diff.keys.map(key => (key.address_info ? key.address_info.label : key.value))
      : null;

    const parsedDiff = {
      from: diff.from,
      to: diff.to,
      name: diff.name,
      field: diff.field,
      keys
    };

    groups[diff.address.label] = groups[diff.address.label]
      ? groups[diff.address.label].concat([parsedDiff])
      : [parsedDiff];
    return groups;
  }, {});

  return { hasBeenCast, executedOn, groupedDiff };
}
