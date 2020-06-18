/** @jsx jsx */
import { slugify } from '../lib/utils';

import { jsx } from 'theme-ui';
import { useState, useEffect, useLayoutEffect } from 'react';
import { Flex, Divider, SxStyleProp } from 'theme-ui';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import Router from 'next/router';

type Props = {
  tabTitles: string[];
  tabPanels: React.ReactNode[];
  hashRoute?: boolean;
};

const TabbedLayout = ({ tabTitles, tabPanels, hashRoute = true }: Props) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const activeTab = tabTitles[activeTabIndex];

  useLayoutEffect(() => {
    const [, hash] = location.href.split('#');
    if (hashRoute && hash) {
      tabTitles.forEach((title, i) => {
        if (slugify(title) === hash) setActiveTabIndex(i);
      });
    }
  }, []);

  useEffect(() => {
    if (hashRoute) {
      Router.replace(`${location.pathname + location.search}#${slugify(activeTab)}`);
    }
  }, [activeTab]);

  return (
    <Flex
      sx={{
        flexDirection: 'column'
      }}
    >
      <Tabs index={activeTabIndex} onChange={index => setActiveTabIndex(index)}>
        <TabList sx={{ display: 'block', bg: 'inherit' }}>
          {tabTitles.map(tabTitle => (
            <Tab key={tabTitle} sx={getTabStyles({ isActive: activeTab === tabTitle })}>
              {tabTitle}
            </Tab>
          ))}
        </TabList>
        <Divider />
        <TabPanels>
          {tabPanels.map((tabPanel, i) => (
            <TabPanel key={i}>{tabPanel}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

const baseTabStyles: SxStyleProp = {
  flex: 1,
  appearance: 'none',
  margin: 0,
  py: 2,
  fontSize: 3,
  fontWeight: 500,
  border: 'none !important',
  bg: 'inherit'
};

const getTabStyles = ({ isActive }) => ({
  ...baseTabStyles,
  ...(isActive ? { color: 'primary' } : {})
});

export default TabbedLayout;
