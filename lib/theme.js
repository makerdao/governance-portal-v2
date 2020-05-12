import theme from '@makerdao/dai-ui-theme-maker';
import { icons } from '@makerdao/dai-ui-icons';

export default {
  ...theme,
  shadows: {
    ...theme.shadows,
    faint: '0px 2px 7px #EAEFF4'
  },
  colors: {
    ...theme.colors,
    background: '#F9F9F9',
    mutedAlt: '#708390'
  },
  sizes: [0, 4, 8, 16, 46, 64, 128, 256, 512, 630, 1200],
  icons: {
    maker: icons.maker,
    chevron_right: icons.chevron_right
  }
};
