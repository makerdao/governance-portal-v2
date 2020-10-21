/** @jsx jsx */
import { Flex, Box, Button, Text, Card, Spinner, jsx } from 'theme-ui';
import { useState, useRef } from 'react';
import { GetStaticProps } from 'next';
import useSWR, { mutate } from 'swr';
import ErrorPage from 'next/error';
import getMaker, { isDefaultNetwork } from '../lib/maker';
import PrimaryLayout from '../components/layouts/Primary';

async function getModuleStats() {
  const maker = await getMaker();
  const esmService = await maker.service('esm')
  let account
  try {
    account = await maker.currentAddress()
  } catch (e) {
    account = {address: '0x0000000000000000000000000000000000000000'}
  }
  return Promise.all([
    esmService.getTotalStaked(),
    esmService.canFire(),
    esmService.thresholdAmount(),
    esmService.fired(),
    esmService.getTotalStakedByAddress(account.address),   
    maker.service('smartContract').getContract('END').when()
  ]);
}

// if we are on the browser, trigger a prefetch as soon as possible
if (typeof window !== 'undefined') {
  getModuleStats().then(stats => {
    mutate('/es-module', stats, false);
  });
}

const ESModule = ({ }) => {
  const { data } = useSWR('/es-module', getModuleStats);
  const [totalStaked, canFire, thresholdAmount, fired, mkrInEsm, cageTime] = data || [];
  const loader = useRef<HTMLDivElement>(null);

  return (
    <PrimaryLayout shortenFooter={true} sx={{ maxWidth: 'container' }}>
        <Text variant='heading'>
          Emergency Shutdown Module
        </Text>
        <Text variant='text' sx={{mt: 2}}>
        The ESM allows MKR holders to shutdown the system without a central authority. Once 50,000 MKR are entered into the ESM, emergency shutdown can be executed. Read the documentation here.
        </Text>
        <Text variant='microHeading' sx={{mt: 4}}>
        Total MKR Burned
        </Text>
        <Card mt={3}>
          <Flex sx={{flexDirection: "row"}}>
            <Text>
              {totalStaked ? (
                `${totalStaked.toString()}     `
              ) : (
                <Box pl="14px" pr="14px">
                  <div ref={loader} />
                </Box>
              )}
            </Text>
            <Text color="#708390" ml="2"
            sx={{fontWeight:"400"}}
            >

              {` of ${thresholdAmount ? thresholdAmount.toString() : '---'}`}
            </Text>
          </Flex>
          <Box
            sx={{ borderRadius: 'medium', minHeight: 20, backgroundColor:"#F6F8F9", height: '20px', my: 3}}
          >
            <Box as='div'
              style={{
                borderRadius: 'inherit',
                height: '100%',
                transition: 'width 0.2s ease-in',
                backgroundColor: '#f75625',
                minHeight: '20px',
                width: totalStaked
                  ? `${
                      totalStaked.gte(thresholdAmount)
                        ? '100'
                        : totalStaked.mul(100)
                            .div(thresholdAmount)
                            .toFixed()
                    }%`
                  : '0%'
              }}
            />
          </Box>
          <Flex
          sx={{flexDirection: 'row', justifyContent: 'space-between'}}
          >
             {totalStaked ? (
              <Button variant='outline' sx={{color: 'onNotice', borderColor: 'notice'}}>
                Burn Your MKR
              </Button>
            ) : (
              <Box pl="14px" pr="14px">
                <Spinner size={'20px'} color="notice" />
              </Box>
            )}
            <Text color="#9FAFB9" sx={{fontWeight:"300", alignSelf:"center"}}>
              {mkrInEsm && mkrInEsm.gt(0) ? (
                <Box>
                  You burned{' '}
                  <strong style={{ fontWeight: 'bold' }}>
                    {mkrInEsm.toString()}
                  </strong>{' '}
                  in the ESM
                </Box>
              ) : (
                'You have no MKR in the ESM'
              )}
            </Text>
          </Flex>
      </Card>
        <Text variant='microHeading' mt={5}>
        ESM History
        </Text>
        <Card mt={3}>

        </Card>
    </PrimaryLayout>
  );
};

export default function ESModulePage({
}): JSX.Element {
  const [error, setError] = useState<string>();

  if (error) {
    return <ErrorPage statusCode={404} title="Error fetching ES module" />;
  }

  if (!isDefaultNetwork())
    return (
      <PrimaryLayout>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  return (
    <ESModule />
  );
}

export const getStaticProps: GetStaticProps = async () => {

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
    }
  };
};
