import { BigNumber } from 'ethers';
import { isBefore } from 'date-fns';
import { formatDateWithTime } from 'lib/datetime';
import { formatValue } from 'lib/string';
import { SpellData } from '../types/spellData';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

const SPELL_SCHEDULED_DATE_OVERRIDES = {
  '0xB70fB4eE900650DCaE5dD63Fd06E07F0b3a45d13': 'December 7, 2020, 14:00 UTC'
};

export const getStatusText = ({
  proposalAddress,
  spellData,
  mkrOnHat
}: {
  proposalAddress: string;
  spellData?: SpellData;
  mkrOnHat?: BigNumber;
}): string => {
  if (!spellData) return 'Fetching status...';

  if (proposalAddress === ZERO_ADDRESS) {
    return `This proposal surpased the 80,000 MKR threshold on ${formatDateWithTime(1607704862000)} – the new
    chief has been activated!`;
  }

  // check if scheduled or has been executed
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
      }.`;
    }
  }

  // hasn't been passed or executed, check if expired
  const isExpired = spellData.expiration ? isBefore(new Date(spellData.expiration), new Date()) : false;
  if (isExpired) {
    return `This proposal expired at ${formatDateWithTime(
      spellData.expiration
    )} and can no longer be executed.`;
  }

  // not expired, passed, or executed, check support level
  if (!!spellData.mkrSupport && !!mkrOnHat) {
    return `${formatValue(
      mkrOnHat.sub(spellData.mkrSupport)
    )} additional MKR support needed to pass. Expires at ${formatDateWithTime(spellData.expiration)}.`;
  }

  // hasn't been scheduled, executed, hasn't expired, must be active and not passed yet
  return 'This proposal has not yet passed and is not available for execution.';
};
