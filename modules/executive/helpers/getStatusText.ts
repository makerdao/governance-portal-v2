import { formatDateWithTime } from 'lib/datetime';
import { SPELL_SCHEDULED_DATE_OVERRIDES } from 'lib/constants';
import { SpellData } from '../types/spellData';
import { ZERO_ADDRESS } from 'stores/accounts';

export const getStatusText = (proposalAddress: string, spellData?: SpellData): string => {
  if (!spellData) return 'Fetching status...';

  if (proposalAddress === ZERO_ADDRESS) {
    return `This proposal surpased the 80,000 MKR threshold on ${formatDateWithTime(1607704862000)} – the new
    chief has been activated!`;
  }

  if (spellData.hasBeenScheduled || spellData.dateExecuted) {
    if (typeof spellData.dateExecuted === 'string') {
      return `Passed on ${formatDateWithTime(spellData.datePassed)}. Executed on ${formatDateWithTime(
        spellData.dateExecuted
      )}.`;
    } else {
      return `Passed on ${formatDateWithTime(spellData.datePassed)}. Available for execution on
      ${
        SPELL_SCHEDULED_DATE_OVERRIDES[proposalAddress] ||
        formatDateWithTime(spellData.nextCastTime || spellData.eta)
      }
      .`;
    }
  }
  return 'This proposal has not yet passed and is not available for execution.';
};
