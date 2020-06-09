/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useState } from 'react';
import { Flex, Divider, SxStyleProp } from 'theme-ui';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';

type Props = {
  tabTitles: string[];
  tabPanels: React.ReactNode[];
};

const TabbedLayout = ({ tabTitles, tabPanels }: Props) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const activeTab = tabTitles[activeTabIndex];

  return (
    <Flex
      sx={{
        flexDirection: 'column'
      }}
    >
      <Tabs index={activeTabIndex} onChange={index => setActiveTabIndex(index)}>
        <TabList>
          {tabTitles.map(tabTitle => (
            <Tab key={tabTitle} sx={getTabStyles({ isActive: activeTab === tabTitle })}>
              {tabTitle}
            </Tab>
          ))}
        </TabList>
        <Divider sx={{ color: 'muted' }} />
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
  border: 'none',
  bg: 'inherit'
};

const getTabStyles = ({ isActive }) => ({
  ...baseTabStyles,
  ...(isActive ? { color: 'primary' } : {})
});

export default TabbedLayout;
