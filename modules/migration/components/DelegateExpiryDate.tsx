import { Text, Flex, Heading, Link as ThemeUILink, Button } from 'theme-ui';
import React, { useState } from 'react';
import LocalIcon from 'modules/app/components/Icon';
import { DateWithHover } from 'modules/app/components/DateWithHover';
import { Delegate } from 'modules/delegates/types';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { fadeIn, slideUp } from 'lib/keyframes';
import BoxWithClose from 'modules/app/components/BoxWithClose';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';

export default function DelegateExpiryDate({
  delegate,
  reverse
}: {
  delegate: Delegate;
  reverse?: boolean;
}): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const bpi = useBreakpointIndex();

  const openModal = () => {
    if (!delegate.isAboutToExpire && !delegate.expired) {
      return;
    }
    setModalOpen(true);
  };

  return (
    <Flex
      sx={{
        flexDirection: reverse ? 'row-reverse' : ['row-reverse', 'row'],
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '18px',
        cursor: delegate.isAboutToExpire || delegate.expired ? 'pointer' : 'inherit'
      }}
      onClick={openModal}
    >
      <Text variant="caps" color={'onSecondary'} sx={{ mr: 2 }}>
        <Flex>
          <Text sx={{ mr: 1 }}>
            {delegate.expired ? 'EXPIRED' : delegate.isAboutToExpire ? 'EXPIRING' : 'EXPIRES'}
          </Text>{' '}
          <DateWithHover date={delegate.expirationDate} />
        </Flex>
      </Text>
      <Flex
        sx={{
          alignContent: 'center',
          mr: reverse ? 2 : [2, 0]
        }}
      >
        {!delegate.expired && !delegate.isAboutToExpire && (
          <LocalIcon
            name="calendarcross"
            sx={{
              color: 'primary'
            }}
          />
        )}
        {(delegate.expired || delegate.isAboutToExpire) && (
          <Icon
            name="info"
            sx={{
              color: delegate.expired ? 'warning' : 'voterYellow'
            }}
          />
        )}
      </Flex>
      {modalOpen && (
        <DialogOverlay isOpen={modalOpen} onDismiss={() => setModalOpen(false)}>
          <DialogContent
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
                : {
                    variant: 'dialog.desktop',
                    animation: `${fadeIn} 350ms ease`,
                    width: '580px',
                    px: 5,
                    py: 4
                  }
            }
          >
            <BoxWithClose close={() => setModalOpen(false)}>
              <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Icon
                  name={'info'}
                  color={delegate.expired ? 'warning' : 'voterYellow'}
                  sx={{
                    size: 50,
                    mb: 3
                  }}
                />
                <Heading sx={{ textAlign: 'center', mb: 3 }}>
                  This delegate contract {delegate.expired ? 'has expired' : 'is about to expire'}.
                </Heading>
                <Text sx={{ mb: 3, color: 'onSecondary', textAlign: 'center' }}>
                  Maker delegate contracts expire after 1 year. Please{' '}
                  <InternalLink href="/migration/delegator" title="Migrate your MKR">
                    <span sx={{ color: 'accentBlue' }}>migrate your MKR</span>
                  </InternalLink>{' '}
                  by undelegating from the expiring/expired contracts and redelegating to the new contracts.
                </Text>
                <ThemeUILink
                  href={'https://manual.makerdao.com/delegation/delegate-expiration'}
                  sx={{ mb: 3 }}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Text px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                    Read More
                    <Icon name="arrowTopRight" pt={2} color="accentBlue" />
                  </Text>
                </ThemeUILink>
                <Button
                  sx={{ borderColor: 'primary', width: '100%', color: 'primary' }}
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </Button>
              </Flex>
            </BoxWithClose>
          </DialogContent>
        </DialogOverlay>
      )}
    </Flex>
  );
}
