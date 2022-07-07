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

export default function DelegateExpiryDate({ delegate }: { delegate: Delegate }): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const bpi = useBreakpointIndex();

  const openModal = () => {
    if (!delegate.isAboutToExpire || delegate.expired) {
      return;
    }
    setModalOpen(true);
  };
  return (
    <Flex
      sx={{
        flexDirection: ['row-reverse', 'row'],
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
            {delegate.expired ? 'EXPIRED' : delegate.isAboutToExpire ? 'ABOUT TO EXPIRE' : 'EXPIRES'}
          </Text>{' '}
          <DateWithHover date={delegate.expirationDate} />
        </Flex>
      </Text>
      <Flex
        sx={{
          alignContent: 'center',
          mr: [1, 0]
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
                color={delegate.isAboutToExpire ? 'voterYellow' : 'warning'}
                sx={{
                  size: 50,
                  mb: 3
                }}
              />
              <Heading sx={{ textAlign: 'center', mb: 3 }}>
                This delegate contract {delegate.isAboutToExpire ? 'is about to expire' : 'has expired'}.
              </Heading>
              <Text sx={{ mb: 3, color: 'onSecondary' }}>
                Maker delegate contracts expire after 1 year. Please migrate your MKR by undelegating from the
                expiring/expired contracts and redelegating to the new contracts.
              </Text>
              <ThemeUILink
                href={'https://manual.makerdao.com/governance/what-is-delegation'}
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
    </Flex>
  );
}
