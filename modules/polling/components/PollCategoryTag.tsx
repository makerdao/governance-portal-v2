import TagComponent from 'modules/app/components/Tag';
import { Tag } from 'modules/app/types/tag.dt';
import { Box } from 'theme-ui';

export function PollCategoryTag({ tag, onClick }: { tag: Tag; onClick?: () => void }): React.ReactElement {
  const categories = {
    Collateral: {
      color: 'tagColorOne',
      backgroundColor: 'tagColorOneBg'
    },
    Oracles: {
      color: 'tagColorTwo',
      backgroundColor: 'tagColorTwoBg'
    },
    Governance: {
      color: 'tagColorThree',
      backgroundColor: 'tagColorThreeBg'
    },
    'Risk Variable': {
      color: 'tagColorFour',
      backgroundColor: 'tagColorFourBg'
    },
    Risk: {
      color: 'tagColorFive',
      backgroundColor: 'tagColorFiveBg'
    },
    Technical: {
      color: 'tagColorSix',
      backgroundColor: 'tagColorSixBg'
    },
    Other: {
      color: 'tagColorSeven',
      backgroundColor: 'tagColorSevenBg'
    },
    MIPs: {
      color: 'tagColorEight',
      backgroundColor: 'tagColorEightBg'
    },
    Rates: {
      color: 'tagColorNine',
      backgroundColor: 'tagColorNineBg'
    },
    Auctions: {
      color: 'tagColorTen',
      backgroundColor: 'tagColorTenBg'
    },
    Greenlight: {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    },
    Transfer: {
      color: 'tagColorTwelve',
      backgroundColor: 'tagColorTwelveBg'
    },
    Budget: {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    },
    'Core Unit': {
      color: 'tagColorFourteen',
      backgroundColor: 'tagColorFourteenBg'
    },
    Test: {
      color: 'tagColorFifteen',
      backgroundColor: 'tagColorFifteenBg'
    },
    Offboard: {
      color: 'tagColorSixteen',
      backgroundColor: 'tagColorSixteenBg'
    },
    Uncategorized: {
      color: 'tagColorSeventeen',
      backgroundColor: 'tagColorSeventeenBg'
    },
    'High Impact': {
      color: 'tagColorFive',
      backgroundColor: 'tagColorFiveBg'
    },
    'Medium Impact': {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    },
    'Low Impact': {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    }
  };

  return (
    <Box
      sx={{
        cursor: onClick ? 'pointer' : 'inherit'
      }}
      onClick={onClick}
      title={`See all ${tag.id} polls`}
    >
      <TagComponent
        tag={tag}
        color={categories[tag.id]?.color}
        backgroundColor={categories[tag.id]?.backgroundColor}
      />
    </Box>
  );
}
