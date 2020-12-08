import { ETH, BAT, USDC, WBTC, ZRX, KNC, MANA } from '@makerdao/dai-plugin-mcd';

export default [
  {
    symbol: 'ETH-A', // how it's displayed in the UI
    key: 'ETH-A', // the actual ilk name used in the vat
    gem: 'ETH', // the actual asset that's being locked
    currency: ETH // the associated dai.js currency type
  },
  {
    symbol: 'BAT-A',
    key: 'BAT-A',
    gem: 'BAT',
    currency: BAT
  },
  {
    symbol: 'USDC-A',
    key: 'USDC-A',
    gem: 'USDC',
    currency: USDC
  },
  {
    symbol: 'USDC-B',
    key: 'USDC-B',
    gem: 'USDC',
    currency: USDC
  },
  {
    symbol: 'WBTC-A',
    key: 'WBTC-A',
    gem: 'WBTC',
    currency: WBTC
  },
  {
    symbol: 'ZRX-A',
    key: 'ZRX-A',
    gem: 'ZRX',
    currency: ZRX
  },
  {
    symbol: 'KNC-A',
    key: 'KNC-A',
    gem: 'KNC',
    currency: KNC
  },
  {
    symbol: 'MANA-A',
    key: 'MANA-A',
    gem: 'MANA',
    currency: MANA
  }
];
