import { useState, useEffect } from 'react';
import { Flex, Divider, ThemeUIStyleObject } from 'theme-ui';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import Router from 'next/router';
import { slugify } from 'lib/utils';
import { ErrorBoundary } from './ErrorBoundary';

type Props = {
  tabTitles: string[];
  tabRoutes?: string[];
  tabPanels: React.ReactNode[];
  tabListStyles?: ThemeUIStyleObject;
  hashRoute?: boolean;
  banner?: JSX.Element | null;
};

const TabbedLayout = ({
  tabTitles,
  tabRoutes = [],
  tabPanels,
  tabListStyles = {},
  hashRoute = true,
  banner
}: Props): JSX.Element => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  if (tabRoutes.length === 0) tabRoutes = tabTitles;
  const activeTab = tabRoutes[activeTabIndex];

  useEffect(() => {
    const [, hash] = location.href.split('#');
    if (hashRoute && hash) {
      tabRoutes.forEach((title, i) => {
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
        <TabList sx={{ display: ['flex', 'block'], bg: 'inherit', ...tabListStyles }}>
          {tabRoutes.map((tabRoute, index) => (
            <Tab
              key={tabRoute}
              data-testid={`tab-${tabRoute}`}
              sx={{
                ...getTabStyles({ isActive: activeTab === tabRoute, isFirst: index === 0 })
              }}
            >
              <ErrorBoundary componentName={tabRoute}>{tabTitles[index]}</ErrorBoundary>
            </Tab>
          ))}
        </TabList>
        {banner ? banner : <Divider sx={{ m: 0 }} />}
        <TabPanels>
          {tabPanels.map((tabPanel, i) => (
            <ErrorBoundary key={`tab-body-${i}`} componentName={tabRoutes[i]}>
              <TabPanel>{tabPanel}</TabPanel>
            </ErrorBoundary>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

const baseTabStyles: ThemeUIStyleObject = {
  flex: 1,
  appearance: 'none',
  mx: 3,
  p: 0,
  mb: 2,
  color: 'textSecondary',
  fontSize: [1, 3],
  fontWeight: 400,
  border: 'none !important',
  bg: 'inherit',
  outline: 'none'
};

const getTabStyles = ({ isActive, isFirst }) => ({
  ...baseTabStyles,
  ...(isActive ? { color: 'primary', fontWeight: 500 } : {}),
  ...(isFirst ? { ml: 0 } : {})
});

export default TabbedLayout;
